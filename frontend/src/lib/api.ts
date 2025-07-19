import axios from "axios";

const API_BASE_URL = "http://localhost:5123/";

export interface Position {
	x: number;
	y: number;
	z: number;
	p: number;
	r: number;
}

export interface GripperState {
	open: boolean;
}

export interface MoveCommand extends Position {
	interpolatePoints: number;
}

class RobotApi {
	private apiUrl: string;
	constructor(apiUrl: string = API_BASE_URL) {
		this.apiUrl = apiUrl;
	}

	setApiUrl(apiUrl: string): void {
		this.apiUrl = apiUrl;
	}
	async connect(comPort: string): Promise<void> {
		return axios.post(`${this.apiUrl}/connect`, { comPort });
	}

	async disconnect(): Promise<void> {
		const response = await fetch(`${this.apiUrl}/disconnect`, {
			method: "POST",
		});
		if (!response.ok) throw new Error("Failed to disconnect");
	}

	async getPosition(forceUpdate = false): Promise<Position> {
		const url = new URL(`${this.apiUrl}/position`);
		url.searchParams.set("forceUpdateByHardware", forceUpdate.toString());

		const response = await fetch(url.toString());
		if (!response.ok) throw new Error("Failed to get position");
		return response.json();
	}

	async updatePosition(): Promise<void> {
		const response = await fetch(`${this.apiUrl}/update-position`, {
			method: "POST",
		});
		if (!response.ok) throw new Error("Failed to update position");
	}

	async reset(): Promise<void> {
		const response = await fetch(`${this.apiUrl}/reset`, {
			method: "POST",
		});
		if (!response.ok) throw new Error("Failed to reset");
	}

	async home(): Promise<void> {
		const response = await fetch(`${this.apiUrl}/home`, {
			method: "POST",
		});
		if (!response.ok) throw new Error("Failed to home");
	}

	async moveTo(command: MoveCommand): Promise<void> {
		const response = await fetch(`${this.apiUrl}/move`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(command),
		});
		if (!response.ok) throw new Error("Failed to move");
	}

	async moveDelta(command: MoveDeltaCommand): Promise<void> {
		const response = await fetch(`${this.apiUrl}/move-delta`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(command),
		});
		if (!response.ok) throw new Error("Failed to move delta");
	}

	async rotate(command: RotateCommand): Promise<void> {
		const response = await fetch(`${this.apiUrl}/rotate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(command),
		});
		if (!response.ok) throw new Error("Failed to rotate");
	}

	async cleanRValue(command: CleanRCommand): Promise<void> {
		const response = await fetch(`${this.apiUrl}/clean-r-value`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(command),
		});
		if (!response.ok) throw new Error("Failed to clean R value");
	}

	async setGripper(closed: boolean): Promise<void> {
		const response = await fetch(`${this.apiUrl}/gripper`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ closed }),
		});
		if (!response.ok) throw new Error("Failed to set gripper");
	}

	async getGripperState(): Promise<GripperState> {
		const response = await fetch(`${this.apiUrl}/gripper`);
		if (!response.ok) throw new Error("Failed to get gripper state");
		return response.json();
	}

	async setToolLength(lengthInMillimeter: number): Promise<void> {
		const response = await fetch(`${this.apiUrl}/tool-length`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ lengthInMillimeter }),
		});
		if (!response.ok) throw new Error("Failed to set tool length");
	}

	async setGripperPressure(command: GripperPressureCommand): Promise<void> {
		const response = await fetch(`${this.apiUrl}/gripper-pressure`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(command),
		});
		if (!response.ok) throw new Error("Failed to set gripper pressure");
	}

	async setSpeed(speed: number): Promise<void> {
		const response = await fetch(`${this.apiUrl}/speed`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ speed }),
		});
		if (!response.ok) throw new Error("Failed to set speed");
	}

	async setConsoleOutput(enabled: boolean): Promise<void> {
		const response = await fetch(`${this.apiUrl}/console-output`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ enabled }),
		});
		if (!response.ok) throw new Error("Failed to set console output");
	}

	async sendCommand(command: string): Promise<void> {
		const response = await fetch(`${this.apiUrl}/command`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ command }),
		});
		if (!response.ok) throw new Error("Failed to send command");
	}
	async sendJsonPositions(positions: Position[]): Promise<void> {
		const response = await fetch(`${this.apiUrl}/json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ positions }),
		});
		if (!response.ok) throw new Error("Failed to send command");
	}
}

export const robotApi = new RobotApi();
