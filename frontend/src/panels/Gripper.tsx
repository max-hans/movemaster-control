import type { FunctionComponent } from "react";
import PanelCard from "@/components/PanelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRobot from "@/hooks/useRobot";

const GripperPanel: FunctionComponent = () => {
	const { setGripper, isConnected, isGripperOpen, updateToolLength } =
		useRobot();
	return (
		<PanelCard title="Gripper">
			<div className="flex flex-col gap-4">
				<h2>Tool length</h2>
				<form
					className="flex flex-col gap-4"
					autoComplete="off"
					onSubmit={(e) => {
						e.preventDefault();
						const formData = new FormData(e.currentTarget);
						const length = parseFloat(formData.get("length") as string);
						updateToolLength(length);
					}}
				>
					<Input
						type="text"
						placeholder="Tool length in mm"
						name="length"
						defaultValue="100mm"
					/>

					<Button type="submit">Set</Button>
				</form>

				<h2>Gripper state</h2>
				<Button
					variant={isGripperOpen ? "secondary" : "default"}
					onClick={() => {
						setGripper(true).catch((error) => {
							console.error("Failed to open gripper:", error);
						});
					}}
					disabled={!isConnected}
				>
					Open
				</Button>
				<Button
					variant={!isGripperOpen ? "secondary" : "default"}
					onClick={() => {
						setGripper(false).catch((error) => {
							console.error("Failed to close gripper:", error);
						});
					}}
					disabled={!isConnected}
				>
					Close
				</Button>
			</div>
		</PanelCard>
	);
};

export default GripperPanel;
