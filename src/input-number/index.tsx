// import DownOutlined from '@ant-design/icons/DownOutlined';
// import UpOutlined from '@ant-design/icons/UpOutlined';
import classNames from 'classnames';
import type { InputNumberProps as RcInputNumberProps } from 'rc-input-number';
import RcInputNumber from 'rc-input-number';
import type { ValueType } from 'rc-input-number/lib/utils/MiniDecimal';
import * as React from 'react';
// import { ConfigContext } from '../config-provider';
// import DisabledContext from '../config-provider/DisabledContext';
// import type { SizeType } from '../config-provider/SizeContext';
// import SizeContext from '../config-provider/SizeContext';
// import { FormItemInputContext, NoFormStyle } from '../form/context';
import { useCompactItemContext } from '../space/Compact';
import { cloneElement } from '../_util/reactNode';
import type { InputStatus } from '../_util/statusUtils';
import { getStatusClassNames } from '../_util/statusUtils';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export interface InputNumberProps<T extends ValueType = ValueType>
  extends Omit<RcInputNumberProps<T>, 'prefix' | 'size' | 'controls'> {
  prefixCls?: string;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  size?: SizeType;
  disabled?: boolean;
  bordered?: boolean;
  status?: InputStatus;
  controls?: boolean | { upIcon?: React.ReactNode; downIcon?: React.ReactNode };
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    // const { getPrefixCls, direction } = React.useContext(ConfigContext);
    // const size = React.useContext(SizeContext);
    const [focused, setFocus] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const {
      className,
      size: customizeSize,
      disabled: customDisabled,
      prefixCls: customizePrefixCls,
      addonBefore,
      addonAfter,
      prefix,
      bordered = true,
      readOnly,
      status: customStatus,
      controls,
      ...others
    } = props;

    // const prefixCls = getPrefixCls('input-number', customizePrefixCls);
    const prefixCls = 'future-input-number';
    // const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);
    const { compactSize, compactItemClassnames } = useCompactItemContext(
      prefixCls,
      undefined,
    );

    // let upIcon = <UpOutlined className={`${prefixCls}-handler-up-inner`} />;
    // let downIcon = <DownOutlined className={`${prefixCls}-handler-down-inner`} />;

    let upIcon = <div className={`${prefixCls}-handler-up-inner`}>up</div>;
    let downIcon = <div className={`${prefixCls}-handler-down-inner`}>dw</div>;

    const controlsTemp = typeof controls === 'boolean' ? controls : undefined;

    if (typeof controls === 'object') {
      upIcon =
        typeof controls.upIcon === 'undefined' ? (
          upIcon
        ) : (
          <span className={`${prefixCls}-handler-up-inner`}>
            {controls.upIcon}
          </span>
        );
      downIcon =
        typeof controls.downIcon === 'undefined' ? (
          downIcon
        ) : (
          <span className={`${prefixCls}-handler-down-inner`}>
            {controls.downIcon}
          </span>
        );
    }

    // const {
    //   hasFeedback,
    //   status: contextStatus,
    //   isFormItemInput,
    //   feedbackIcon,
    // } = useContext(FormItemInputContext);
    // const mergedStatus = getMergedStatus(contextStatus, customStatus);
    const mergedStatus = customStatus;

    // const mergeSize = compactSize || customizeSize || size;
    const mergeSize = customizeSize;

    // ===================== Disabled =====================
    // const disabled = React.useContext(DisabledContext);
    // const mergedDisabled = customDisabled ?? disabled;
    const mergedDisabled = customDisabled;

    const inputNumberClass = classNames(
      {
        [`${prefixCls}-lg`]: mergeSize === 'large',
        [`${prefixCls}-sm`]: mergeSize === 'small',
        // [`${prefixCls}-rtl`]: direction === 'rtl',
        [`${prefixCls}-borderless`]: !bordered,
        // [`${prefixCls}-in-form-item`]: isFormItemInput,
      },
      getStatusClassNames(prefixCls, mergedStatus),
      compactItemClassnames,
      className,
    );

    let element = (
      <RcInputNumber
        ref={inputRef}
        disabled={mergedDisabled}
        className={inputNumberClass}
        upHandler={upIcon}
        downHandler={downIcon}
        prefixCls={prefixCls}
        readOnly={readOnly}
        controls={controlsTemp}
        {...others}
      />
    );

    // if (prefix != null || hasFeedback) {
    if (prefix != null) {
      const affixWrapperCls = classNames(
        `${prefixCls}-affix-wrapper`,
        // getStatusClassNames(`${prefixCls}-affix-wrapper`, mergedStatus, hasFeedback),
        getStatusClassNames(`${prefixCls}-affix-wrapper`, mergedStatus, false),
        {
          [`${prefixCls}-affix-wrapper-focused`]: focused,
          [`${prefixCls}-affix-wrapper-disabled`]: props.disabled,
          // [`${prefixCls}-affix-wrapper-sm`]: size === 'small',
          // [`${prefixCls}-affix-wrapper-lg`]: size === 'large',
          [`${prefixCls}-affix-wrapper-sm`]: customizeSize === 'small',
          [`${prefixCls}-affix-wrapper-lg`]: customizeSize === 'large',
          // [`${prefixCls}-affix-wrapper-rtl`]: direction === 'rtl',
          [`${prefixCls}-affix-wrapper-readonly`]: readOnly,
          [`${prefixCls}-affix-wrapper-borderless`]: !bordered,
          // className will go to addon wrapper
          [`${className}`]: !(addonBefore || addonAfter) && className,
        },
      );

      element = (
        <div
          className={affixWrapperCls}
          style={props.style}
          onMouseUp={() => inputRef.current!.focus()}
        >
          {prefix && <span className={`${prefixCls}-prefix`}>{prefix}</span>}
          {cloneElement(element, {
            style: null,
            value: props.value,
            onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
              setFocus(true);
              props.onFocus?.(event);
            },
            onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
              setFocus(false);
              props.onBlur?.(event);
            },
          })}
          {/* {hasFeedback && <span className={`${prefixCls}-suffix`}>{feedbackIcon}</span>} */}
        </div>
      );
    }

    if (addonBefore != null || addonAfter != null) {
      const wrapperClassName = `${prefixCls}-group`;
      const addonClassName = `${wrapperClassName}-addon`;
      const addonBeforeNode = addonBefore ? (
        <div className={addonClassName}>{addonBefore}</div>
      ) : null;
      const addonAfterNode = addonAfter ? (
        <div className={addonClassName}>{addonAfter}</div>
      ) : null;

      const mergedWrapperClassName = classNames(
        `${prefixCls}-wrapper`,
        wrapperClassName,
        {
          // [`${wrapperClassName}-rtl`]: direction === 'rtl',
        },
      );

      const mergedGroupClassName = classNames(
        `${prefixCls}-group-wrapper`,
        {
          // [`${prefixCls}-group-wrapper-sm`]: size === 'small',
          // [`${prefixCls}-group-wrapper-lg`]: size === 'large',
          [`${prefixCls}-group-wrapper-sm`]: customizeSize === 'small',
          [`${prefixCls}-group-wrapper-lg`]: customizeSize === 'large',
          // [`${prefixCls}-group-wrapper-rtl`]: direction === 'rtl',
        },
        // getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback),
        getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, false),
        className,
      );
      element = (
        <div className={mergedGroupClassName} style={props.style}>
          <div className={mergedWrapperClassName}>
            {/* {addonBeforeNode && (
            <NoFormStyle status override>
              {addonBeforeNode}
            </NoFormStyle>
          )} */}
            {addonBeforeNode && addonBeforeNode}
            {cloneElement(element, { style: null, disabled: mergedDisabled })}
            {/* {addonAfterNode && (
            <NoFormStyle status override>
              {addonAfterNode}
            </NoFormStyle>
          )} */}
            {addonAfterNode && addonAfterNode}
          </div>
        </div>
      );
    }

    return element;
  },
);

export default InputNumber as (<T extends ValueType = ValueType>(
  props: React.PropsWithChildren<InputNumberProps<T>> & {
    ref?: React.Ref<HTMLInputElement>;
  },
) => React.ReactElement) & { displayName?: string };