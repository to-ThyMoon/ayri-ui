import classNames from 'classnames';
import debounce from 'lodash/debounce';
import omit from 'omit.js';
import * as React from 'react';
// import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import { cloneElement, isValidElement } from '../_util/reactNode';
import { tuple } from '../_util/type';

import LoadingGray from './icon/loading-gray.png';
import LoadingRed from './icon/loading-red.png';
import LoadingWhite from './icon/loading-white.png';

const SpinSizes = tuple('small', 'default', 'large');
export type SpinSize = (typeof SpinSizes)[number];
export type SpinIndicator = React.ReactElement<HTMLElement>;

export interface SpinProps {
  children: React.ReactNode;

  // 三种转圈样式色彩
  // 红色的是买家端常规的，灰色的是不适合同红色的地方使用，白色的是背景为深色状态下使用 （设计：黄骏宇 语）
  type: 'red' | 'gray' | 'white' | undefined;

  prefixCls?: string;
  className?: string;
  spinning?: boolean;
  style?: React.CSSProperties;
  size?: SpinSize;
  tip?: string;
  delay?: number;
  wrapperClassName?: string;
  indicator?: SpinIndicator;
}

export interface SpinState {
  spinning?: boolean;
  notCssAnimationSupported?: boolean;
}

// Render indicator
let defaultIndicator: React.ReactNode = null;

function renderIndicator(prefixCls: string, props: SpinProps): React.ReactNode {
  const { indicator } = props;
  const dotClassName = `${prefixCls}-dot`;

  switch (props.type) {
    case 'red':
      defaultIndicator = <img src={LoadingRed} alt="" />;
      break;
    case 'gray':
      defaultIndicator = <img src={LoadingGray} alt="" />;
      break;
    case 'white':
      defaultIndicator = <img src={LoadingWhite} alt="" />;
      break;
    default:
      defaultIndicator = <img src={LoadingRed} alt="" />;
      break;
  }

  // should not be render default indicator when indicator value is null
  if (indicator === null) {
    return null;
  }

  if (isValidElement(indicator)) {
    return cloneElement(indicator, {
      className: classNames(indicator.props.className, dotClassName),
    });
  }

  if (isValidElement(defaultIndicator)) {
    return cloneElement(defaultIndicator as SpinIndicator, {
      className: classNames(
        (defaultIndicator as SpinIndicator).props.className,
        dotClassName,
        `${prefixCls}-dot-spin`,
      ),
    });
  }

  return (
    <span className={classNames(dotClassName, `${prefixCls}-dot-spin`)}>
      <i className={`${prefixCls}-dot-item`} />
      <i className={`${prefixCls}-dot-item`} />
      <i className={`${prefixCls}-dot-item`} />
      <i className={`${prefixCls}-dot-item`} />
    </span>
  );
}

function shouldDelay(spinning?: boolean, delay?: number): boolean {
  return !!spinning && !!delay && !isNaN(Number(delay));
}

class Spin extends React.Component<SpinProps, SpinState> {
  static defaultProps = {
    spinning: true,
    size: 'default' as SpinSize,
    wrapperClassName: '',
  };

  static setDefaultIndicator(indicator: React.ReactNode) {
    defaultIndicator = indicator;
  }

  originalUpdateSpinning: () => void;

  constructor(props: SpinProps) {
    super(props);

    const { spinning, delay } = props;
    const shouldBeDelayed = shouldDelay(spinning, delay);
    this.state = {
      spinning: spinning && !shouldBeDelayed,
    };
    this.originalUpdateSpinning = this.updateSpinning;
    this.debouncifyUpdateSpinning(props);
  }

  componentDidMount() {
    this.updateSpinning();
  }

  componentDidUpdate() {
    this.debouncifyUpdateSpinning();
    this.updateSpinning();
  }

  componentWillUnmount() {
    this.cancelExistingSpin();
  }

  debouncifyUpdateSpinning = (props?: SpinProps) => {
    const { delay } = props || this.props;
    if (delay) {
      this.cancelExistingSpin();
      this.updateSpinning = debounce(this.originalUpdateSpinning, delay);
    }
  };

  updateSpinning = () => {
    const { spinning } = this.props;
    const { spinning: currentSpinning } = this.state;
    if (currentSpinning !== spinning) {
      this.setState({ spinning });
    }
  };

  cancelExistingSpin() {
    const { updateSpinning } = this;
    if (updateSpinning && (updateSpinning as any).cancel) {
      (updateSpinning as any).cancel();
    }
  }

  isNestedPattern() {
    return !!(this.props && typeof this.props.children !== 'undefined');
  }

  renderSpin = () => {
    const {
      prefixCls: customizePrefixCls,
      className,
      size,
      tip,
      wrapperClassName,
      style,
      ...restProps
    } = this.props;
    const { spinning } = this.state;

    // const prefixCls = getPrefixCls('spin', customizePrefixCls);
    const prefixCls = 'future-spin';
    const spinClassName = classNames(
      prefixCls,
      {
        [`${prefixCls}-sm`]: size === 'small',
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-spinning`]: spinning,
        [`${prefixCls}-show-text`]: !!tip,
        // [`${prefixCls}-rtl`]: direction === 'rtl',
      },
      className,
    );

    // fix https://fb.me/react-unknown-prop
    const divProps = omit(restProps, ['spinning', 'delay', 'indicator']);

    const spinElement = (
      <div {...divProps} style={style} className={spinClassName}>
        {renderIndicator(prefixCls, this.props)}
        {tip ? <div className={`${prefixCls}-text`}>{tip}</div> : null}
      </div>
    );
    if (this.isNestedPattern()) {
      const containerClassName = classNames(`${prefixCls}-container`, {
        [`${prefixCls}-blur`]: spinning,
      });
      return (
        <div
          {...divProps}
          className={classNames(
            `${prefixCls}-nested-loading`,
            wrapperClassName,
          )}
        >
          {spinning && <div key="loading">{spinElement}</div>}
          <div className={containerClassName} key="container">
            {this.props.children}
          </div>
        </div>
      );
    }
    return spinElement;
  };

  render() {
    // return <ConfigConsumer>{this.renderSpin}</ConfigConsumer>;
    return this.renderSpin();
  }
}

export default Spin;