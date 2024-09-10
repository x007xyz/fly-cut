import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
})
