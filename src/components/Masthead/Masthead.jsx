import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Masthead.style';
import { useApp } from '../../contexts';
import { ICON, L10N } from '../../modules';
import { Icon, Input, Text, View } from '../../primitives';
import { Eyebrow } from '../Eyebrow';
import { IconButton } from '../IconButton';
import { Logo } from '../Logo';

const Masthead = ({ children, onBack, onQueryChange, onSearch, query, rule = true, searching = false, section }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={style.wrapper}>
      <View row spaceBetween style={style.container}>
        {searching ? (
          <>
            <View row flex style={style.field}>
              <Icon name={ICON.SEARCH} size="s" tone="muted" />
              <Input
                autoFocus
                placeholder={`${L10N.SEARCH}…`}
                style={style.input}
                value={query}
                onChange={onQueryChange}
              />
            </View>
            <IconButton icon={ICON.CLOSE} onPress={onSearch} />
          </>
        ) : (
          <>
            {onBack ? (
              // On a pushed screen the name is the identity, so it takes the slot the wordmark holds on a tab.
              <View row style={style.left}>
                <IconButton icon={ICON.BACK} onPress={onBack} />
                {section ? (
                  <Text bold numberOfLines={1} style={style.title} uppercase>
                    {section}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Logo />
            )}
            <View row style={style.right}>
              {!onBack && section ? <Eyebrow>{section}</Eyebrow> : null}
              {onSearch ? <IconButton icon={ICON.SEARCH} onPress={onSearch} /> : null}
              {children}
            </View>
          </>
        )}
      </View>
      {rule ? <View style={style.rule} /> : null}
    </View>
  );
};

Masthead.propTypes = {
  children: PropTypes.node,
  onBack: PropTypes.func,
  onQueryChange: PropTypes.func,
  onSearch: PropTypes.func,
  query: PropTypes.string,
  rule: PropTypes.bool,
  searching: PropTypes.bool,
  section: PropTypes.string,
};

export { Masthead };
