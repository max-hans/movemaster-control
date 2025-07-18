import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import commandLineArgs from "command-line-args";
import { Hono } from "hono";
import z from "zod";
import { defaultPort } from "./defaults";
import robot from "./robot-factory";
import { positionSchema } from "./schemas";

import { cors } from "hono/cors";
import { logger } from "hono/logger";

const optionDefinitions = [
  { name: "port", alias: "p", type: Number, defaultValue: defaultPort },
];

const options = commandLineArgs(optionDefinitions);

const app = new Hono();

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

app.use("*", cors());
app.use(logger(customLogger));
app.get("/status", async (c) => {
  const newStatus = {
    isConnected: robot.isConnected(),
    position: robot.getPosition(),
    gripperOpen: robot.toolIsOpen,
    speed: robot.getSpeed(),
    toolLength: robot.getToolLength(),
  };
  return c.json(newStatus);
});
app.get("/position", async (c) => {
  try {
    const position = robot.getPosition();
    return c.json({ position });
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.get("/update-position", async (c) => {
  try {
    await robot.updatePositionFromHardware();
    const position = robot.getPosition();
    return c.json({ position });
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.get("/serialports", async (c) => {
  try {
    const ports = await robot.listPorts();

    return c.json({ ports });
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.post(
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
        500
      );
    }
  }
);

app.post(
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
        500
      );
    }
  }
);

app.post(
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
        500
      );
    }
  }
);
app.post("/disconnect", async (c) => {
  try {
    await robot.disconnect();
    return c.json({});
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.post(
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
        500
      );
    }
  }
);

app.post(
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
        500
      );
    }
  }
);

app.post(
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
        500
      );
    }
  }
);

const port = options.port ?? defaultPort;

serve({ fetch: app.fetch, port });

console.log(`Server running on http://localhost:${port}`);
