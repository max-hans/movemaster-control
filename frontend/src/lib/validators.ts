import z from "zod";
import type { Position } from "./api";

const positionsSchema = z.array(
	z.object({
		x: z.number(),
		y: z.number(),
		z: z.number(),
		p: z.number(),
		r: z.number(),
	}),
);

export const parsePositionsJson = (
	value: string,
): { success: boolean; positions: Position[] } => {
	try {
		const parsed = JSON.parse(value);
		const result = positionsSchema.safeParse(parsed);
		if (result.success) {
			return { success: true, positions: result.data };
		} else {
			return { success: false, positions: [] };
		}
	} catch (_e) {
		return { success: false, positions: [] };
	}
};
