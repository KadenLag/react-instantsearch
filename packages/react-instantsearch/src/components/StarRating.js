import React, { PropTypes, Component } from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';
import { isEmpty } from 'lodash';
const cx = classNames('StarRating');

class StarRating extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    count: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        count: PropTypes.number,
      })
    ),
    canRefine: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  onClick(min, max, e) {
    e.preventDefault();
    e.stopPropagation();
    if (
      min === this.props.currentRefinement.min &&
      max === this.props.currentRefinement.max
    ) {
      this.props.refine({ min: this.props.min, max: this.props.max });
    } else {
      this.props.refine({ min, max });
    }
  }

  buildItem(
    { max, lowerBound, count, translate, createURL, isLastSelectableItem }
  ) {
    const disabled = !count;
    const isCurrentMinLower = this.props.currentRefinement.min < lowerBound;
    const selected = (isLastSelectableItem && isCurrentMinLower) ||
      (!disabled &&
        lowerBound === this.props.currentRefinement.min &&
        max === this.props.currentRefinement.max);

    const icons = [];
    for (let icon = 0; icon < max; icon++) {
      const iconTheme = icon >= lowerBound ? 'ratingIconEmpty' : 'ratingIcon';
      icons.push(
        <span
          key={icon}
          {...cx(
            iconTheme,
            selected && `${iconTheme}Selected`,
            disabled && `${iconTheme}Disabled`
          )}
        />
      );
    }

    // The last item of the list (the default item), should not
    // be clickable if it is selected.
    const isLastAndSelect = isLastSelectableItem && selected;
    const StarsWrapper = isLastAndSelect ? 'div' : 'a';
    const onClickHandler = isLastAndSelect
      ? {}
      : {
          href: createURL({ min: lowerBound, max }),
          onClick: this.onClick.bind(this, lowerBound, max),
        };

    return (
      <StarsWrapper
        {...cx(
          'ratingLink',
          selected && 'ratingLinkSelected',
          disabled && 'ratingLinkDisabled'
        )}
        disabled={disabled}
        key={lowerBound}
        {...onClickHandler}
      >
        {icons}
        <span
          {...cx(
            'ratingLabel',
            selected && 'ratingLabelSelected',
            disabled && 'ratingLabelDisabled'
          )}
        >
          {translate('ratingLabel')}
        </span>
        <span> </span>
        <span
          {...cx(
            'ratingCount',
            selected && 'ratingCountSelected',
            disabled && 'ratingCountDisabled'
          )}
        >
          {count}
        </span>
      </StarsWrapper>
    );
  }

  render() {
    const {
      translate,
      refine,
      min,
      max,
      count,
      createURL,
      canRefine,
    } = this.props;
    const items = [];
    for (let i = max; i >= min; i--) {
      const hasCount = !isEmpty(count.filter(item => Number(item.value) === i));
      const lastSelectableItem = count.reduce(
        (acc, item) =>
          item.value < acc.value || (!acc.value && hasCount) ? item : acc,
        {}
      );
      const itemCount = count.reduce(
        (acc, item) => item.value >= i && hasCount ? acc + item.count : acc,
        0
      );
      items.push(
        this.buildItem({
          lowerBound: i,
          max,
          refine,
          count: itemCount,
          translate,
          createURL,
          isLastSelectableItem: i === Number(lastSelectableItem.value),
        })
      );
    }
    return (
      <div {...cx('root', !canRefine && 'noRefinement')}>
        {items}
      </div>
    );
  }
}

export default translatable({
  ratingLabel: ' & Up',
})(StarRating);
