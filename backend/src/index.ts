import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { zValidator } from "@hono/zod-validator";
import commandLineArgs from "command-line-args";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import z from "zod";
import { defaultPort } from "./defaults";
import robot from "./robot";
import { positionSchema } from "./schemas";

const optionDefinitions = [
	{ name: "port", alias: "p", type: Number, defaultValue: defaultPort },
];

const options = commandLineArgs(optionDefinitions);

const app = new Hono();

export const customLogger = (message: string, ...rest: string[]) => {
	console.log(message, ...rest);
};

app
	.use("*", cors())
	.use(logger(customLogger))
	.use("*", serveStatic({ root: "public" }));

const api = new Hono();

api.get("/status", async (c) => {
	const newStatus = {
		isConnected: robot.isConnected(),
		position: robot.getPosition(),
		gripperOpen: robot.toolIsOpen,
		speed: robot.getSpeed(),
		toolLength: robot.getToolLength(),
	};
	return c.json(newStatus);
});
api.get("/position", async (c) => {
	try {
		const position = robot.getPosition();
		return c.json({ position });
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.get("/update-position", async (c) => {
	try {
		await robot.getActualPosition();
		const position = robot.getPosition();
		return c.json({ position });
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.get("/serialports", async (c) => {
	try {
		const ports = await robot.listPorts();

		return c.json({ ports });
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.post(
	"/move",
	zValidator("json", z.object({ position: positionSchema })),
	async (c) => {
		const { position } = c.req.valid("json");
		try {
			await robot.moveTo(position);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/move-path",
	zValidator("json", z.object({ positions: z.array(positionSchema) })),
	async (c) => {
		try {
			await robot.movePath(c.req.valid("json").positions);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/connect",
	zValidator("json", z.object({ port: z.string() })),
	async (c) => {
		const { port } = c.req.valid("json");

		try {
			await robot.connect(port);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);
api.post("/disconnect", async (c) => {
	try {
		await robot.disconnect();
		return c.json({});
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.post(
	"/set-gripper",
	zValidator("json", z.object({ open: z.boolean() })),
	async (c) => {
		const { open } = c.req.valid("json");
		try {
			await robot.setGripper(open);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/set-speed",
	zValidator("json", z.object({ speed: z.number().int().min(0).max(9) })),
	async (c) => {
		const { speed } = c.req.valid("json");
		try {
			await robot.setSpeed(speed);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/set-tool-length",
	zValidator("json", z.object({ length: z.number().min(0) })),
	async (c) => {
		const { length } = c.req.valid("json");
		try {
			await robot.setToolLength(length);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post("/home", async (c) => {
	try {
		await robot.moveToHomePosition();
		return c.json({});
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.post("/nest", async (c) => {
	try {
		await robot.nest();
		return c.json({});
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.post("/reset", async (c) => {
	try {
		await robot.reset();
		return c.json({});
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

api.post(
	"/set-grip-pressure",
	zValidator(
		"json",
		z.object({
			startingGripForce: z.number().int().min(0).max(15),
			retainedGrippingForce: z.number().int().min(0).max(15),
			startGrippingForceRetentionTime: z.number().int().min(0).max(99),
		}),
	),
	async (c) => {
		const {
			startingGripForce,
			retainedGrippingForce,
			startGrippingForceRetentionTime,
		} = c.req.valid("json");
		try {
			await robot.setGripPressure(
				startingGripForce,
				retainedGrippingForce,
				startGrippingForceRetentionTime,
			);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/rotate-axis",
	zValidator("json", z.object({ position: positionSchema })),
	async (c) => {
		const { position } = c.req.valid("json");
		try {
			await robot.rotateAxis(
				position.x,
				position.y,
				position.z,
				position.p,
				position.r,
			);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/move-delta",
	zValidator(
		"json",
		z.object({
			position: positionSchema,
			interpolatePoints: z.number().int().min(0).optional(),
		}),
	),
	async (c) => {
		const { position, interpolatePoints } = c.req.valid("json");
		try {
			await robot.moveDelta(
				position.x,
				position.y,
				position.z,
				position.p,
				position.r,
				interpolatePoints,
			);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/move-to-xyz",
	zValidator(
		"json",
		z.object({
			position: z.object({
				x: z.number(),
				y: z.number(),
				z: z.number(),
			}),
			interpolatePoints: z.number().int().min(0).optional(),
		}),
	),
	async (c) => {
		const { position, interpolatePoints } = c.req.valid("json");
		try {
			await robot.moveToXYZ(
				position.x,
				position.y,
				position.z,
				interpolatePoints,
			);
			return c.json({});
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.post(
	"/clean-up-r-value",
	zValidator(
		"json",
		z.object({
			position: z.object({
				x: z.number(),
				y: z.number(),
			}),
			rTarget: z.number(),
		}),
	),
	async (c) => {
		const { position, rTarget } = c.req.valid("json");
		try {
			const cleanedR = robot.cleanUpRValue(position.x, position.y, rTarget);
			return c.json({ cleanedR });
		} catch (error) {
			return c.json(
				{
					ok: false,
					error: error instanceof Error ? error.message : String(error),
				},
				500,
			);
		}
	},
);

api.get("/gripper-closed", async (c) => {
	try {
		const closed = robot.getGripperClosed();
		return c.json({ closed });
	} catch (error) {
		return c.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});

const port = options.port ?? defaultPort;

app.route("/api", api);

serve({ fetch: app.fetch, port });

console.log(`Server running on http://localhost:${port}`);
