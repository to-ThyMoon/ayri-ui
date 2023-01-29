import classNames from 'classnames';
import toArray from 'rc-util/lib/Children/toArray';
import * as React from 'react';
// import { ConfigContext } from '../config-provider';
// import { SizeType } from '../config-provider/SizeContext';
import Item from './Item';

export type SizeType = 'small' | 'middle' | 'large' | undefined;

export const SpaceContext = React.createContext({
  latestIndex: 0,
  horizontalSize: 0,
  verticalSize: 0,
});

export type SpaceSize = SizeType | number;

export interface SpaceProps {
  children: React.ReactNode;
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
  small: 8,
  middle: 16,
  large: 24,
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

  const [horizontalSize, verticalSize] = React.useMemo(
    () =>
      (
        (Array.isArray(size) ? size : [size, size]) as [SpaceSize, SpaceSize]
      ).map((item) => getNumberSize(item)),
    [size],
  );

  const childNodes = toArray(children, { keepEmpty: true });

  if (childNodes.length === 0) {
    return null;
  }

  const mergedAlign =
    align === undefined && direction === 'horizontal' ? 'center' : align;
  // const prefixCls = getPrefixCls('space', customizePrefixCls);
  const prefixCls = 'future-space';
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

    /* eslint-disable react/no-array-index-key */
    return (
      <Item
        className={itemClassName}
        key={`${itemClassName}-${i}`}
        direction={direction}
        index={i}
        marginDirection={marginDirection}
        split={split}
        wrap={wrap}
      >
        {child}
      </Item>
    );
    /* eslint-enable */
  });

  return (
    <div
      className={cn}
      style={{
        ...(wrap && { flexWrap: 'wrap', marginBottom: -verticalSize }),
        ...style,
      }}
      {...otherProps}
    >
      <SpaceContext.Provider
        value={{ horizontalSize, verticalSize, latestIndex }}
      >
        {nodes}
      </SpaceContext.Provider>
    </div>
  );
};

export default Space;
