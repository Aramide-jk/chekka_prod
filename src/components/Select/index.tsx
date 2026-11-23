"use client";

import { useId } from "react";
import ReactSelect, {
	type GroupBase,
	type StylesConfig,
} from "react-select";

export interface ISelectOption {
	value: string;
	label: string;
}

interface IProps {
	options: ISelectOption[];
	value?: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	isDisabled?: boolean;
	isSearchable?: boolean;
	ariaLabel?: string;
	// Stable id so server/client render the same DOM ids (avoids hydration
	// warnings). Defaults to a React-generated id.
	instanceId?: string;
	// Id applied to the inner input — set this and point a <label htmlFor> at it
	// to associate a visible label with the control.
	inputId?: string;
}

// Themed react-select that maps the app's design tokens onto the control,
// menu, and options. Used everywhere in place of native <select> so dropdowns
// look and behave consistently.
const styles: StylesConfig<ISelectOption, false, GroupBase<ISelectOption>> = {
	control: (base, state) => ({
		...base,
		minHeight: 46,
		background: "var(--surface-2)",
		borderRadius: "var(--r-sm)",
		borderColor: state.isFocused
			? "var(--gold)"
			: "var(--hairline-strong)",
		boxShadow: "none",
		fontSize: 14,
		color: "var(--ink)",
		cursor: "pointer",
		transition: "border-color 0.15s ease",
		"&:hover": { borderColor: "var(--gold)" },
	}),
	valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
	singleValue: (base) => ({ ...base, color: "var(--ink)" }),
	input: (base) => ({ ...base, color: "var(--ink)" }),
	placeholder: (base) => ({ ...base, color: "var(--ink-faint)" }),
	indicatorSeparator: (base) => ({
		...base,
		backgroundColor: "var(--hairline)",
	}),
	dropdownIndicator: (base, state) => ({
		...base,
		color: state.isFocused ? "var(--gold-bright)" : "var(--ink-muted)",
		"&:hover": { color: "var(--gold-bright)" },
	}),
	menu: (base) => ({
		...base,
		background: "var(--surface)",
		border: "1px solid var(--hairline)",
		borderRadius: "var(--r-sm)",
		overflow: "hidden",
		zIndex: 200,
	}),
	menuPortal: (base) => ({ ...base, zIndex: 200 }),
	option: (base, state) => ({
		...base,
		fontSize: 14,
		cursor: "pointer",
		color: state.isSelected ? "var(--gold-bright)" : "var(--ink)",
		background: state.isSelected
			? "var(--gold-wash)"
			: state.isFocused
				? "var(--surface-2)"
				: "transparent",
		"&:active": { background: "var(--surface-2)" },
	}),
	noOptionsMessage: (base) => ({ ...base, color: "var(--ink-muted)" }),
};

export default function Select({
	options,
	value,
	onChange,
	placeholder = "Select…",
	isDisabled,
	isSearchable = false,
	ariaLabel,
	instanceId,
	inputId,
}: IProps) {
	const generatedId = useId();
	const selected = options.find((o) => o.value === value) ?? null;
	return (
		<ReactSelect<ISelectOption, false>
			instanceId={instanceId ?? generatedId}
			inputId={inputId}
			options={options}
			value={selected}
			onChange={(opt) => {
				if (opt) onChange(opt.value);
			}}
			placeholder={placeholder}
			isDisabled={isDisabled}
			isSearchable={isSearchable}
			aria-label={ariaLabel}
			styles={styles}
			menuPortalTarget={
				typeof document !== "undefined" ? document.body : undefined
			}
		/>
	);
}
