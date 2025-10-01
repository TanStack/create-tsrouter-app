import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Slider } from "./slider";

const meta = {
  title: "Form/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn() },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Volume",
    id: "volume",
    value: 50,
  },
};

export const Skill: Story = {
  args: {
    label: "Plays Guitar",
    id: "guitar",
    value: 75,
    min: 0,
    max: 100,
  },
};

export const NoValue: Story = {
  args: {
    label: "Experience Level",
    id: "experience",
    value: 30,
    showValue: false,
  },
};

export const CustomRange: Story = {
  args: {
    label: "Custom Range",
    id: "custom-range",
    value: 5,
    min: 1,
    max: 20,
    step: 1,
  },
};
