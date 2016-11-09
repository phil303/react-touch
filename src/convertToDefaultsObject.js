import isArray from 'lodash.isarray';
import isObject from 'lodash.isobject';

const convertToDefaultsObject = (value, mainKey='main', defaultValues={}) => {
  if (isArray(value) || !isObject(value)) {
    return { ...defaultValues, [mainKey]: value };
  }
  return { ...defaultValues, ...value };
};

export default convertToDefaultsObject;
