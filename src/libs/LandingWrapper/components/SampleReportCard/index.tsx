"use client";

import { Eyebrow, Icon } from "@/components";
import {
	CarSubStyled,
	CarTitleStyled,
	HeaderRowStyled,
	MonoStyled,
	SummaryCellStyled,
	SummaryStyled,
	VerdictHeadStyled,
	VerdictStyled,
	VerdictTitleStyled,
	WrapStyled,
} from "./styled";

export default function SampleReportCard() {
	return (
		<WrapStyled>
			<HeaderRowStyled>
				<Eyebrow $gold>Inspection Report · Sample</Eyebrow>
				<MonoStyled>CHK-2026-0418</MonoStyled>
			</HeaderRowStyled>
			<CarTitleStyled>Honda Accord Sport 2020</CarTitleStyled>
			<CarSubStyled>VIN 1HGCV1F36LA047288 · 64,200 km · Pearl White</CarSubStyled>

			<SummaryStyled>
				<SummaryCellStyled $tone="good">
					<div className="num">38</div>
					<Eyebrow className="label">Passed</Eyebrow>
				</SummaryCellStyled>
				<SummaryCellStyled $tone="caution">
					<div className="num">4</div>
					<Eyebrow className="label">Minor</Eyebrow>
				</SummaryCellStyled>
				<SummaryCellStyled $tone="danger">
					<div className="num">0</div>
					<Eyebrow className="label">Serious</Eyebrow>
				</SummaryCellStyled>
			</SummaryStyled>

			<VerdictStyled>
				<VerdictHeadStyled>
					<Icon name="check" size={18} />
					<Eyebrow className="label">Verdict</Eyebrow>
				</VerdictHeadStyled>
				<VerdictTitleStyled>Worth Buying</VerdictTitleStyled>
				<p className="verdict-summary">
					A well-maintained 2020 Accord with no significant issues.
					Minor cosmetic items only.
				</p>
			</VerdictStyled>
		</WrapStyled>
	);
}
