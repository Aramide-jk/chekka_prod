"use client";

import { type InputHTMLAttributes, useState } from "react";
import { Icon } from "@/components";
import {
	HintStyled,
	InputStyled,
	InputWrapStyled,
	LabelRowStyled,
	LabelStyled,
	ToggleStyled,
	WrapStyled,
} from "./styled";

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	hint?: string;
}

export default function Field({ label, hint, type, ...rest }: IProps) {
	const [reveal, setReveal] = useState(false);
	const isPassword = type === "password";
	const resolvedType = isPassword && reveal ? "text" : type;

	return (
		<WrapStyled>
			<LabelRowStyled>
				<LabelStyled>{label}</LabelStyled>
				{hint && <HintStyled>{hint}</HintStyled>}
			</LabelRowStyled>
			<InputWrapStyled>
				<InputStyled type={resolvedType} $hasToggle={isPassword} {...rest} />
				{isPassword && (
					<ToggleStyled
						type="button"
						// Prevent the wrapping <label> from re-focusing the input
						// (and stealing the click) when the toggle is pressed.
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => setReveal((r) => !r)}
						// Avoid the field name ("Password") in the accessible
						// name so getByLabel("Password") still resolves uniquely
						// to the input, not this toggle.
						aria-label={reveal ? "Hide characters" : "Show characters"}
						title={reveal ? "Hide" : "Show"}
					>
						<Icon name={reveal ? "eye-off" : "eye"} size={16} />
					</ToggleStyled>
				)}
			</InputWrapStyled>
		</WrapStyled>
	);
}
