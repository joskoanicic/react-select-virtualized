import { FastReactSelect } from './components/fast-react-select';
import PropTypes from 'prop-types';
import React, { useRef, useImperativeHandle, useState, forwardRef, useMemo, memo, useCallback, useEffect } from 'react';
import './styles.css';
import { buildListComponents, getStyles } from './helpers/select';
import { defaultGroupFormat } from './components/grouped-virtualized-list/helpers/grouped-list.jsx';
import 'react-virtualized/styles.css';
import { optionsPropTypes } from './helpers/prop-types';

let Select = (props, ref) => {
  const reactSelect = useRef('react-select');

  const {
    grouped,
    formatGroupHeaderLabel,
    value,
    groupHeaderHeight,
    onChange,
    defaultValue,
    optionHeight,
    creatable,
  } = props;

  const [selection, setSelection] = useState(defaultValue || value);

  const defaultProps = {
    isMulti: false,
    isClearable: true,
    isDisabled: false,
    className: `react-select-virtualized`,
    isSearchable: true,
    blurInputOnSelect: true,
  };

  // this is only so it is react-select like compatible I prefer to be more strict with defaultValue.
  useEffect(() => setSelection(value), [value]);

  const memoGroupHeaderOptions = useMemo(() => {
    if (!grouped && !formatGroupHeaderLabel && !groupHeaderHeight) return { formatGroupHeaderLabel: false };

    const groupHeaderHeightValue = groupHeaderHeight || optionHeight;
    return {
      groupHeaderHeight: groupHeaderHeightValue,
      formatGroupHeaderLabel: formatGroupHeaderLabel || defaultGroupFormat(groupHeaderHeightValue),
    };
  }, [grouped, formatGroupHeaderLabel, groupHeaderHeight, optionHeight]);

  const onChangeHandler = useCallback(
    (value, { action }) => {
      if (!value || (value && !value.__isNew__)) {
        onChange(value, { action });
        setSelection(value);
      }
    },
    [onChange, setSelection],
  );

  useImperativeHandle(ref, () => ({
    clear: () => {
      setSelection(null);
    },
    focus: () => {
      reactSelect.current.focus();
    },
    select: (item) => setSelection(item),
  }));

  return (
    <FastReactSelect
      creatable={creatable}
      ref={reactSelect}
      {...defaultProps}
      {...props}
      styles={{ ...getStyles(), ...props.styles }} // keep react-select styles implementation and pass to any customization done
      value={selection}
      onChange={onChangeHandler}
      options={props.options}
      components={{
        ...props.components,
        ...buildListComponents({
          ...props,
          ...memoGroupHeaderOptions,
        }),
      }} // props.components comes from react-select if present
    />
  );
};

Select = forwardRef(Select);

Select = memo(Select);

Select.propTypes = {
  ...FastReactSelect.propTypes,
  options: optionsPropTypes.isRequired,
  onChange: PropTypes.func,
  grouped: PropTypes.bool, // this is only for performance enhancement so we do not need to iterate in the array many times. It is not needed if formatGroupHeaderLabel or groupHeaderHeight are defined
  formatGroupHeaderLabel: PropTypes.func,
  optionHeight: PropTypes.number,
  groupHeaderHeight: PropTypes.number,
  defaultValue: PropTypes.object,
  creatable: PropTypes.bool,
};

Select.defaultProps = {
  grouped: false,
  optionHeight: 31,
  creatable: false,
  onChange: () => {},
};

Select.displayName = 'Select';

export default Select;
