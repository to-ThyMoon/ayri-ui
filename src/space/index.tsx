import classNames from 'classnames';
import toArray from 'rc-util/lib/Children/toArray';
import * as React from 'react';
// import { ConfigContext } from '../config-provider';
// import type { SizeType } from '../config-provider/SizeContext';
import useFlexGapSupport from '../_util/hooks/useFlexGapSupport';
import Compact from './Compact';
import Item from './Item';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export const SpaceContext = React.createContext({
  latestIndex: 0,
  horizontalSize: 0,
  verticalSize: 0,
  supportFlexGap: false,
});

export type SpaceSize = SizeType | number;

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: SpaceSize | [SpaceSize, SpaceSize];
  direction?: 'horizontal' | 'vertical';
  // No `stretch` since many components do not support that.
  align?: 'start' | 'end' | 'center' | 'baseline';
  split?: React.ReactNode;
  wrap?: boolean;
}

const spaceSize = {
  nano: 5,
  small: 10,
  middle: 15,
  large: 20,
  extreme: 30,
  supreme: 40,
};

function getNumberSize(size: SpaceSize) {
  return typeof size === 'string' ? spaceSize[size] : size || 0;
}

const Space: React.FC<SpaceProps> = (props) => {
  // const { getPrefixCls, space, direction: directionConfig } = React.useContext(ConfigContext);

  const {
    // size = space?.size || 'small',
    size = 'small',
    align,
    className,
    children,
    direction = 'horizontal',
    prefixCls: customizePrefixCls,
    split,
    style,
    wrap = false,
    ...otherProps
  } = props;

  const supportFlexGap = useFlexGapSupport();

  const [horizontalSize, verticalSize] = React.useMemo(
    () =>
      (
        (Array.isArray(size) ? size : [size, size]) as [SpaceSize, SpaceSize]
      ).map((item) => getNumberSize(item)),
    [size],
  );

  const childNodes = toArray(children, { keepEmpty: true });

  const mergedAlign =
    align === undefined && direction === 'horizontal' ? 'center' : align;
  // const prefixCls = getPrefixCls('space', customizePrefixCls);
  const prefixCls = 'ft-space';
  const cn = classNames(
    prefixCls,
    `${prefixCls}-${direction}`,
    {
      // [`${prefixCls}-rtl`]: directionConfig === 'rtl',
      [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
    },
    className,
  );

  const itemClassName = `${prefixCls}-item`;

  // const marginDirection = directionConfig === 'rtl' ? 'marginLeft' : 'marginRight';
  const marginDirection = 'marginRight';

  // Calculate latest one
  let latestIndex = 0;
  const nodes = childNodes.map((child, i) => {
    if (child !== null && child !== undefined) {
      latestIndex = i;
    }

    const key = (child && child.key) || `${itemClassName}-${i}`;

    return (
      <Item
        className={itemClassName}
        key={key}
        direction={direction}
        index={i}
        marginDirection={marginDirection}
        split={split}
        wrap={wrap}
      >
        {child}
      </Item>
    );
  });

  const spaceContext = React.useMemo(
    () => ({ horizontalSize, verticalSize, latestIndex, supportFlexGap }),
    [horizontalSize, verticalSize, latestIndex, supportFlexGap],
  );

  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }

  const gapStyle: React.CSSProperties = {};

  if (wrap) {
    gapStyle.flexWrap = 'wrap';

    // Patch for gap not support
    if (!supportFlexGap) {
      gapStyle.marginBottom = -verticalSize;
    }
  }

  if (supportFlexGap) {
    gapStyle.columnGap = horizontalSize;
    gapStyle.rowGap = verticalSize;
  }

  return (
    <div
      className={cn}
      style={{
        ...gapStyle,
        ...style,
      }}
      {...otherProps}
    >
      <SpaceContext.Provider value={spaceContext}>
        {nodes}
      </SpaceContext.Provider>
    </div>
  );
};

interface CompoundedComponent extends React.FC<SpaceProps> {
  Compact: typeof Compact;
}

const CompoundedSpace = Space as CompoundedComponent;
CompoundedSpace.Compact = Compact;

export default CompoundedSpace;
