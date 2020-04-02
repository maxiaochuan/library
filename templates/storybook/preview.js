import { addParameters, addDecorator } from '@storybook/react';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import { withA11y } from '@storybook/addon-a11y';
// import centered from '@storybook/addon-centered/react';
// import { withKnobs } from '@storybook/addon-knobs';

addDecorator(withA11y);
// addDecorator(centered);
// addDecorator(withKnobs);

addParameters({
  options: {
    selectedPanel: 'storybook/storysource/panel',
  },
  backgrounds: [
    { name: 'white', value: '#ffffff', default: true },
    { name: 'twitter', value: '#00aced' },
    { name: 'facebook', value: '#3b5998' },
  ],
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
});
