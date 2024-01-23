import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './FormTransaction.style';
import { ScrollView } from '../../../__design-system__';
import { Input, InputCurrency, Option } from '../../../components';
import { getIcon, L10N } from '../../../modules';
import { queryCategories } from '../helpers';

const FormTransaction = ({ form = {}, onChange, type, vault = {} }) => {
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const index = categories.findIndex(({ key }) => key === form.category);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: (index - 1) * optionSnap });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleField = (field, fieldValue) => {
    const next = { ...form, [field]: fieldValue };

    onChange({
      form: next,
      valid: next.category !== undefined && next.title !== '' && next.value > 0,
    });
  };

  const categories = queryCategories({ type });
  const optionSnap = StyleSheet.value('$optionSnap');

  return (
    <>
      <ScrollView horizontal ref={scrollViewRef} snap={optionSnap} style={style.scrollView} width={width}>
        {categories.map((item, index) => (
          <Option
            key={item.key}
            highlight={form.category === item.key}
            icon={getIcon({ type, category: item.key })}
            legend={item.caption}
            onPress={() => handleField('category', item.key)}
            style={[
              style.option,
              index === 0 && style.firstOption,
              index === categories.length - 1 && style.lastOption,
            ]}
          />
        ))}
      </ScrollView>

      <InputCurrency
        currency={vault.currency}
        value={form.value}
        vault={vault}
        onChange={(value) => handleField('value', value)}
        style={style.inputCurrency}
      />

      <Input
        label={L10N.CONCEPT}
        value={form.title}
        onChange={(value) => handleField('title', value)}
        style={style.inputTitle}
      />
    </>
  );
};

FormTransaction.propTypes = {
  form: PropTypes.shape({}).isRequired,
  type: PropTypes.number,
  vault: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormTransaction;
