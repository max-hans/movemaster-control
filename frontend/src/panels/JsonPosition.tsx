import { type FunctionComponent, useState } from "react";
import PanelCard from "@/components/PanelCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useRobot from "@/hooks/useRobot";
import { parsePositionsJson } from "@/lib/validators";

const dummyPositions = [
	{ x: 0, y: 500, z: 300, p: 0, r: 0 },
	{ x: 0, y: 500, z: 320, p: 0, r: 0 },
	{ x: 0, y: 450, z: 320, p: 0, r: 0 },
];

const JsonPositionPanel: FunctionComponent = () => {
	const { isConnected, movePath } = useRobot();
	const [jsonStringData, setJsonStringData] = useState<string>("");

	const parsedJsonData = parsePositionsJson(jsonStringData);

	const handleJsonSubmit = async () => {
		if (!isConnected || !parsedJsonData) return;

		await movePath(parsedJsonData.positions).catch((error) => {
			console.error("Failed to move robot with JSON data:", error);
		});
	};

	return (
		<PanelCard title="Json Positions">
			<div className="flex flex-col gap-4">
				<Textarea
					className="h-full w-full font-mono"
					placeholder="Enter JSON Data"
					name="data"
					value={jsonStringData}
					onChange={(e) => setJsonStringData(e.target.value)}
				/>

				<Button
					onClick={() => setJsonStringData(JSON.stringify(dummyPositions))}
					variant="secondary"
				>
					Add dummy data
				</Button>
				<Button
					onClick={() => {
						try {
							const parsed = JSON.parse(jsonStringData);

							setJsonStringData(JSON.stringify(parsed, null, 2));
						} catch (e) {
							console.error("Failed to prettify JSON:", e);
						}
					}}
					variant="secondary"
				>
					Prettify
				</Button>
				<Button
					onClick={handleJsonSubmit}
					disabled={!isConnected}
					variant={parsedJsonData.success ? "default" : "destructive"}
				>
					{parsedJsonData.success ? (
						<>Submit {parsedJsonData.positions.length} positions</>
					) : (
						"Invalid JSON"
					)}
				</Button>
			</div>
		</PanelCard>
	);
};

export default JsonPositionPanel;
