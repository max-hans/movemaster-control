import type z from "zod";
import type { positionSchema } from "./schemas";

export type Position = z.infer<typeof positionSchema>;

export enum ROBOT_ERRORS {
	HARDWARE_ERROR = 1,
	COMMAND_ERROR = 2,
	UNKNOWN_ERROR = 99,
}
