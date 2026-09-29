import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Survey, AUTO_ADVANCE_DELAY_MS } from "@/components/survey/Survey";
import { WhyUseUs } from "@/components/WhyUseUs";
import { trackPixelEvent } from "@/lib/pixel";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const imgProps = { ...props };
    delete imgProps.priority;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

function progressValue() {
  return Number(screen.getByRole("progressbar").getAttribute("aria-valuenow"));
}

function heading() {
  return screen.getByRole("heading", { level: 2 });
}

describe("Survey", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  async function choose(label: string) {
    await user().click(screen.getByRole("radio", { name: label }));
    await act(async () => {
      vi.advanceTimersByTime(AUTO_ADVANCE_DELAY_MS + 10);
    });
  }

  async function next() {
    await user().click(screen.getByRole("button", { name: "Next" }));
  }

  async function qualify() {
    await user().click(screen.getByRole("button", { name: "See If I Qualify" }));
  }

  async function completeToContact(existingSolar: "Yes" | "No") {
    await user().type(screen.getByLabelText("Postcode"), "2000{Enter}");
    await choose("Own");
    await choose(existingSolar);
    if (existingSolar === "Yes") {
      await choose("More than 5 years");
      await choose("Adding A Battery");
    }
    await choose("$600 - $900");
    await choose("10 - 20 Years");
    await choose("Tile");
    await choose("Minor Shade");
    await user().type(screen.getByLabelText("Street address"), "1 George Street");
    await user().type(screen.getByLabelText("Suburb/City"), "Sydney");
    await next();
    await user().type(screen.getByLabelText("First name"), "Alex");
    await user().type(screen.getByLabelText("Last name"), "Taylor{Enter}");
  }

  it("validates the postcode and advances with Enter", async () => {
    render(<Survey />);
    expect(heading()).toHaveTextContent("See If Your Postcode Qualifies");
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(progressValue()).toBe(0);

    await next();
    const input = screen.getByLabelText("Postcode");
    expect(screen.getByText("Please enter your postcode.")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();

    await user().type(input, "20ab");
    expect(input).toHaveValue("20");
    await user().type(input, "0{Enter}");
    expect(screen.getByText("Please enter a valid 4-digit Australian postcode.")).toBeInTheDocument();

    await user().type(input, "0{Enter}");
    expect(heading()).toHaveTextContent("Do you own your home?");
    expect(heading()).toHaveFocus();
    expect(progressValue()).toBe(10);
  });

  it("requires a choice before Next on radio steps", async () => {
    render(<Survey />);
    await user().type(screen.getByLabelText("Postcode"), "3000{Enter}");
    await next();
    expect(screen.getByRole("alert")).toHaveTextContent("Please select an option to continue.");
    expect(screen.getByRole("radio", { name: "Own" })).toHaveFocus();
  });

  it("shows the renter ineligible state with Previous and no contact fields", async () => {
    render(<Survey />);
    await user().type(screen.getByLabelText("Postcode"), "4000{Enter}");
    await choose("Rent");

    expect(heading()).toHaveTextContent("I'm sorry, currently Veralba Solar can only assist homeowners.");
    expect(screen.getByRole("link", { name: /Energy Made Easy/ })).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(progressValue()).toBe(100);

    await user().click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toHaveTextContent("Do you own your home?");
    expect(screen.getByRole("radio", { name: "Rent" })).toBeChecked();
  });

  it("preserves answers and follows the new branch after going back", async () => {
    render(<Survey />);
    await user().type(screen.getByLabelText("Postcode"), "5000{Enter}");
    await choose("Own");
    await choose("Yes");
    expect(heading()).toHaveTextContent("How old is your existing solar system?");
    const branchProgress = progressValue();

    await user().click(screen.getByRole("button", { name: "Previous" }));
    expect(heading()).toHaveTextContent("Do you already have solar panels?");
    expect(screen.getByRole("radio", { name: "Yes" })).toBeChecked();

    await choose("Solar Hot Water");
    expect(heading()).toHaveTextContent("How high is your quarterly electricity bill?");
    expect(progressValue()).toBeGreaterThan(branchProgress);

    await user().click(screen.getByRole("button", { name: "Previous" }));
    await user().click(screen.getByRole("button", { name: "Previous" }));
    await user().click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByLabelText("Postcode")).toHaveValue("5000");
  });

  it("does not auto-advance on arrow key navigation", async () => {
    render(<Survey />);
    await user().type(screen.getByLabelText("Postcode"), "6000{Enter}");
    const own = screen.getByRole("radio", { name: "Own" });
    own.focus();
    fireEvent.keyDown(own, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("radio", { name: "Rent" }));
    await act(async () => {
      vi.advanceTimersByTime(AUTO_ADVANCE_DELAY_MS * 2);
    });
    expect(heading()).toHaveTextContent("Do you own your home?");
    expect(screen.getByRole("radio", { name: "Rent" })).toBeChecked();
  });

  it("completes the existing-solar path straight from the contact step", async () => {
    render(<Survey />);
    await completeToContact("Yes");

    expect(heading()).toHaveTextContent("How can we reach you?");
    await qualify();
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your mobile number.")).toBeInTheDocument();

    await user().type(screen.getByLabelText("Best email address"), "alex@example");
    await user().type(screen.getByLabelText("Mobile phone number"), "0212345678");
    await qualify();
    expect(screen.getByText(/valid email address/)).toBeInTheDocument();
    expect(screen.getByText(/starting with 04/)).toBeInTheDocument();

    await user().type(screen.getByLabelText("Best email address"), ".com");
    await user().clear(screen.getByLabelText("Mobile phone number"));
    expect(progressValue()).toBe(92);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("target", "_blank");
    expect(screen.queryByText(/verification code/i)).not.toBeInTheDocument();
    await user().type(screen.getByLabelText("Mobile phone number"), "0412345678");
    await qualify();

    expect(heading()).toHaveTextContent("Thanks, Alex! Your eligibility request is ready.");
    expect(progressValue()).toBe(100);
    const summary = screen.getByRole("heading", { name: "Your answers" }).parentElement as HTMLElement;
    expect(within(summary).getByText("1 George Street, Sydney, 2000")).toBeInTheDocument();
    expect(within(summary).getByText("Adding A Battery")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();

    await user().click(screen.getByRole("button", { name: "Start again" }));
    expect(screen.getByLabelText("Postcode")).toHaveValue("");
  });

  it("completes the no-solar path without the existing system questions", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const fbq = vi.fn();
    window.fbq = fbq;
    try {
      render(<Survey />);
      await completeToContact("No");
      await user().type(screen.getByLabelText("Best email address"), "alex@example.com");
      expect(progressValue()).toBe(90);
      expect(fbq).not.toHaveBeenCalled();
      await user().type(screen.getByLabelText("Mobile phone number"), "0412 345 678{Enter}");

      expect(heading()).toHaveTextContent("Your eligibility request is ready.");
      expect(screen.queryByText("Existing system age")).not.toBeInTheDocument();
      expect(screen.queryByText("Reason for enquiry")).not.toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();

      // The Meta Pixel Lead event fires exactly once when the survey is completed.
      expect(fbq).toHaveBeenCalledTimes(1);
      expect(fbq).toHaveBeenCalledWith("track", "Lead", undefined);
    } finally {
      delete window.fbq;
    }
  });
});

describe("Meta Pixel helper", () => {
  it("is a no-op when the pixel has not loaded", () => {
    delete window.fbq;
    expect(trackPixelEvent("Lead")).toBe(false);
  });

  it("forwards events to fbq when it is available", () => {
    const fbq = vi.fn();
    window.fbq = fbq;
    try {
      expect(trackPixelEvent("Lead", { content_name: "solar-eligibility" })).toBe(true);
      expect(fbq).toHaveBeenCalledWith("track", "Lead", { content_name: "solar-eligibility" });
    } finally {
      delete window.fbq;
    }
  });
});

describe("No Net Cost Solar modal", () => {
  it("opens from More, traps focus, and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<WhyUseUs />);
    const more = screen.getByRole("button", { name: "More about No Net Cost Solar" });

    await user.click(more);
    const dialog = screen.getByRole("dialog", { name: "About No Net Cost Solar" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByText(/combination of your solar rebate/)).toBeInTheDocument();
    const closeIcon = screen.getByRole("button", { name: "Close dialog" });
    expect(closeIcon).toHaveFocus();

    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(closeIcon).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(more).toHaveFocus();
  });

  it("closes from the Close button", async () => {
    const user = userEvent.setup();
    render(<WhyUseUs />);
    await user.click(screen.getByRole("button", { name: "More about No Net Cost Solar" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
