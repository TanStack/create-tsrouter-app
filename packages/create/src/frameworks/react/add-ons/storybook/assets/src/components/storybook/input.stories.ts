import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "Form/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email Address",
    id: "email",
    placeholder: "Enter your email",
  },
};

export const Required: Story = {
  args: {
    label: "First Name",
    id: "firstName",
    placeholder: "John",
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    label: "Last Name",
    id: "lastName",
    value: "Doe",
    placeholder: "Enter last name",
  },
};
