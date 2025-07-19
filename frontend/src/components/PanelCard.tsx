import type { FunctionComponent } from "react";

interface PanelCardProps {
	title: string;
	children: React.ReactNode;
}

const PanelCard: FunctionComponent<PanelCardProps> = ({ title, children }) => {
	return (
		<div className="flex flex-col gap-4 p-4 rounded-lg shadow border">
			<h2 className="text-xl font-bold">{title}</h2>
			<hr className="mb-0" />
			<div className="">{children}</div>
		</div>
	);
};

export default PanelCard;
