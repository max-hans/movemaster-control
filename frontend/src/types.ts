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

export interface MoveDeltaCommand {
	x?: number;
	y?: number;
	z?: number;
	p?: number;
	r?: number;
	interpolatePoints?: number;
}

export interface RotateCommand {
	angle: number;
	axis: "x" | "y" | "z";
	interpolatePoints?: number;
}

export interface CleanRCommand {
	targetR: number;
	interpolatePoints?: number;
}

export interface GripperPressureCommand {
	pressure: number;
}
