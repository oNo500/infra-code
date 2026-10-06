import { format, tailwindFormat } from '@infra-x/oxfmt-presets'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...format(),
  ...tailwindFormat({ stylesheet: 'src/styles.css' }),
})
