import type { FunctionComponent } from "react";
import PanelCard from "@/components/PanelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRobot from "@/hooks/useRobot";

const BackendPanel: FunctionComponent = () => {
	const { setBackendUrl, connect } = useRobot();
	return (
		<PanelCard title="Backend">
			<div className="flex flex-col gap-4">
				<form
					className="flex flex-col gap-4"
					autoComplete="off"
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.currentTarget);
						const url = formData.get("url");
						setBackendUrl(url as string);
					}}
				>
					<Input
						type="text"
						placeholder="Backend Url"
						name="url"
						defaultValue="http://localhost:5123"
					/>

					<Button type="submit">Set</Button>
				</form>
				<form
					className="flex flex-col gap-4"
					autoComplete="off"
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.currentTarget);
						const port = formData.get("port");
						connect(port as string);
					}}
				>
					<Input
						type="text"
						placeholder="Serialport Name"
						name="port"
						defaultValue="COM3"
					/>

					<Button type="submit">Connect</Button>
				</form>
			</div>
		</PanelCard>
	);
};

export default BackendPanel;
