import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryCards } from "../../components/SummaryCards";
import { expectedSummary } from "../fixtures";

const emptySummary = {
  totalClusters: 0,
  totalVillages: 0,
  totalBeneficiaries: 0,
  totalSeedsBudget: 0,
  totalToolsBudget: 0,
  grandTotal: 0,
};

describe("loading state", () => {
  it("renders skeleton placeholders", () => {
    const { container } = render(
      <SummaryCards summary={emptySummary} isLoading={true} />,
    );
    expect(
      container.querySelectorAll(".skeleton").length,
    ).toBeGreaterThanOrEqual(6);
  });
  it("does not show card labels while loading", () => {
    render(<SummaryCards summary={emptySummary} isLoading={true} />);
    expect(screen.queryByText("Total Clusters")).toBeNull();
  });
});

describe("loaded state", () => {
  it("renders all 6 card labels", () => {
    render(<SummaryCards summary={expectedSummary} isLoading={false} />);
    expect(screen.getByText("Total Clusters")).toBeInTheDocument();
    expect(screen.getByText("Total Villages")).toBeInTheDocument();
    expect(screen.getByText("Beneficiaries")).toBeInTheDocument();
    expect(screen.getByText("Seeds Budget")).toBeInTheDocument();
    expect(screen.getByText("Tools Budget")).toBeInTheDocument();
    expect(screen.getByText("Grand Total")).toBeInTheDocument();
  });
  it("shows correct cluster count", () => {
    render(<SummaryCards summary={expectedSummary} isLoading={false} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
  it("shows correct village count", () => {
    render(<SummaryCards summary={expectedSummary} isLoading={false} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });
  it("shows correct beneficiary count", () => {
    render(<SummaryCards summary={expectedSummary} isLoading={false} />);
    expect(screen.getByText("460")).toBeInTheDocument();
  });
  it("shows UGX prefix on budget values", () => {
    render(<SummaryCards summary={expectedSummary} isLoading={false} />);
    const ugxElements = screen.getAllByText(/UGX/);
    expect(ugxElements.length).toBeGreaterThanOrEqual(3);
  });
  it("shows zeros when summary is empty", () => {
    render(<SummaryCards summary={emptySummary} isLoading={false} />);
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  });
});
