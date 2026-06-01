import type { Meta, StoryObj } from '@storybook/react-native';

import { PlantDetail } from './PlantDetail';

const meta = {
  title: 'Spec/PlantDetail',
  component: PlantDetail,
  args: {
    name: 'ZZ plant',
    category: 'Independent Roommate',
    description:
      'Likes bright indirect light but tolerates low light and mild neglect. Water every 14 days, use a pot with drainage holes 2–4 cm larger than the roots, and repot every 2–3 years.',
    imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=900',
  },
} satisfies Meta<typeof PlantDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
