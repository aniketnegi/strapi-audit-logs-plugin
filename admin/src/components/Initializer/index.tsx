import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

const Initializer = ({ setPlugin }: any) => {
  const ref = useRef(setPlugin); // keep stable reference

  useEffect(() => {
    ref.current(pluginId); // run once or when pluginId changes
  }, [pluginId]);

  return null; // component does not render UI
};

Initializer.propTypes = {
  setPlugin: PropTypes.func.isRequired,
};

export default Initializer;
