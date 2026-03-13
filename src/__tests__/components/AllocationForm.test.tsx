import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllocationForm } from "../../components/AllocationForm";
import { mockAllocations } from "../fixtures";
import type { AllocationFormData } from "../../types/allocation";

const defaultProps = {
  open: true,
  editTarget: null,
  clusters: ["Cluster A", "Cluster B", "Cluster C"],
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => vi.clearAllMocks());

describe("visibility", () => {
  it("renders nothing when open=false", () => {
    render(<AllocationForm {...defaultProps} open={false} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
  it("renders the modal when open=true", () => {
    render(<AllocationForm {...defaultProps} />);
    expect(screen.getByText("Add New Allocation")).toBeInTheDocument();
  });
});

describe("add vs edit mode", () => {
  it('shows "Add New Allocation" heading in add mode', () => {
    render(<AllocationForm {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Add New Allocation" }),
    ).toBeInTheDocument();
  });
  it('shows "Edit Allocation" heading in edit mode', () => {
    render(
      <AllocationForm {...defaultProps} editTarget={mockAllocations[0]} />,
    );
    expect(
      screen.getByRole("heading", { name: "Edit Allocation" }),
    ).toBeInTheDocument();
  });
  it('shows "Add Allocation" submit button in add mode', () => {
    render(<AllocationForm {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Add Allocation" }),
    ).toBeInTheDocument();
  });
  it('shows "Save Changes" submit button in edit mode', () => {
    render(
      <AllocationForm {...defaultProps} editTarget={mockAllocations[0]} />,
    );
    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
  });
  it("pre-populates village when editTarget provided", () => {
    render(
      <AllocationForm {...defaultProps} editTarget={mockAllocations[0]} />,
    );
    expect(
      (screen.getByPlaceholderText("e.g. Kiyindi") as HTMLInputElement).value,
    ).toBe("Kiyindi");
  });
});

describe("close behaviour", () => {
  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<AllocationForm {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(<AllocationForm {...defaultProps} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("validation", () => {
  it('shows "Village name is required"', async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Village name is required"),
    ).toBeInTheDocument();
  });
  it('shows "Please select a cluster"', async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Please select a cluster"),
    ).toBeInTheDocument();
  });
  it('shows "Must be at least 1 beneficiary"', async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Must be at least 1 beneficiary"),
    ).toBeInTheDocument();
  });
  it('shows "Seeds budget must be greater than 0"', async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Seeds budget must be greater than 0"),
    ).toBeInTheDocument();
  });
  it('shows "Tools budget must be greater than 0"', async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Tools budget must be greater than 0"),
    ).toBeInTheDocument();
  });
  it("rejects 1-character village name", async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText("e.g. Kiyindi"), "X");
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Must be at least 2 characters"),
    ).toBeInTheDocument();
  });
  it("rejects beneficiaries > 10,000", async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText("e.g. 120"), "99999");
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Seems too high — max 10,000"),
    ).toBeInTheDocument();
  });
  it("does not call onSubmit when invalid", async () => {
    const onSubmit = vi.fn();
    render(<AllocationForm {...defaultProps} onSubmit={onSubmit} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("clears error when user starts typing in that field", async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    expect(
      await screen.findByText("Village name is required"),
    ).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("e.g. Kiyindi"), "A");
    expect(screen.queryByText("Village name is required")).toBeNull();
  });
});

describe("successful submission", () => {
  async function fillForm() {
    await userEvent.type(
      screen.getByPlaceholderText("e.g. Kiyindi"),
      "Wantome",
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Cluster B");
    await userEvent.type(screen.getByPlaceholderText("e.g. 120"), "85");
    await userEvent.type(
      screen.getByPlaceholderText("e.g. 2000000"),
      "1400000",
    );
    await userEvent.type(
      screen.getByPlaceholderText("e.g. 1500000"),
      "1050000",
    );
  }

  it("calls onSubmit with correct data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AllocationForm {...defaultProps} onSubmit={onSubmit} />);
    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const [payload] = onSubmit.mock.calls[0] as [AllocationFormData];
    expect(payload.village).toBe("Wantome");
    expect(payload.cluster).toBe("Cluster B");
    expect(payload.beneficiaries).toBe(85);
  });

  it("calls onClose after successful submit", async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AllocationForm
        {...defaultProps}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Add Allocation" }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

describe("total preview", () => {
  it("does not show preview when budgets are zero", () => {
    render(<AllocationForm {...defaultProps} />);
    expect(screen.queryByText("Computed Total Budget")).toBeNull();
  });
  it("shows computed total once both budget fields have values", async () => {
    render(<AllocationForm {...defaultProps} />);
    await userEvent.type(
      screen.getByPlaceholderText("e.g. 2000000"),
      "2000000",
    );
    await userEvent.type(
      screen.getByPlaceholderText("e.g. 1500000"),
      "1500000",
    );
    expect(
      await screen.findByText("Computed Total Budget"),
    ).toBeInTheDocument();
  });
});
