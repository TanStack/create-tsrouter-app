import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { RadioGroup } from "./radio-group";

const meta = {
  title: "Form/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn() },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Employment Type",
    name: "employmentType",
    options: [
      { value: "full-time", label: "Full Time" },
      { value: "part-time", label: "Part Time" },
    ],
  },
};

export const Selected: Story = {
  args: {
    label: "Employment Type",
    name: "employmentType",
    options: [
      { value: "full-time", label: "Full Time" },
      { value: "part-time", label: "Part Time" },
    ],
    value: "full-time",
  },
};

export const MultipleOptions: Story = {
  args: {
    label: "Subscription Plan",
    name: "plan",
    options: [
      { value: "basic", label: "Basic" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ],
    value: "pro",
  },
};
