import { type FunctionComponent, useState } from "react";
import PanelCard from "@/components/PanelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRobot from "@/hooks/useRobot";
import type { Position } from "@/lib/api";

const homePosition: Position = {
  x: 0,
  y: 400,
  z: 200,
  p: 0,
  r: 0,
};

const PositionPanel: FunctionComponent = () => {
  const { moveTo, isConnected, moveToHome, nest, reset, moveDelta } =
    useRobot();

  const [newPosition, setNewPosition] = useState<Position>({ ...homePosition });
  const [deltaPosition, setDeltaPosition] = useState<Position>({
    x: 0,
    y: 0,
    z: 0,
    p: 0,
    r: 0,
  });
  const [interpolatePoints, setInterpolatePoints] = useState<number>(0);
  return (
    <PanelCard title="Position">
      <div className="grid grid-cols-3 gap-2">
        <Input
          type="number"
          value={newPosition.x}
          placeholder="X"
          name="x"
          onChange={(e) =>
            setNewPosition((pos) => ({ ...pos, x: parseFloat(e.target.value) }))
          }
        />
        <Input
          type="number"
          value={newPosition.y}
          placeholder="Y"
          name="y"
          onChange={(e) =>
            setNewPosition((pos) => ({ ...pos, y: parseFloat(e.target.value) }))
          }
        />
        <Input
          type="number"
          value={newPosition.z}
          placeholder="Z"
          name="z"
          onChange={(e) =>
            setNewPosition((pos) => ({ ...pos, z: parseFloat(e.target.value) }))
          }
        />
        <Input
          type="number"
          value={newPosition.p}
          placeholder="P"
          name="p"
          onChange={(e) =>
            setNewPosition((pos) => ({ ...pos, p: parseFloat(e.target.value) }))
          }
        />
        <Input
          type="number"
          value={newPosition.r}
          placeholder="R"
          name="r"
          onChange={(e) =>
            setNewPosition((pos) => ({ ...pos, r: parseFloat(e.target.value) }))
          }
        />
        <Button
          onClick={() =>
            moveTo(newPosition).catch((error) => {
              console.error("Failed to move robot:", error);
            })
          }
          className="col-span-full"
          disabled={!isConnected}
        >
          Move
        </Button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Robot Commands</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() =>
              moveToHome().catch((error) => {
                console.error("Failed to move to home:", error);
              })
            }
            disabled={!isConnected}
            variant="outline"
          >
            Home
          </Button>
          <Button
            onClick={() =>
              nest().catch((error) => {
                console.error("Failed to nest:", error);
              })
            }
            disabled={!isConnected}
            variant="outline"
          >
            Nest
          </Button>
          <Button
            onClick={() =>
              reset().catch((error) => {
                console.error("Failed to reset:", error);
              })
            }
            disabled={!isConnected}
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Delta Movement</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Input
            type="number"
            value={deltaPosition.x}
            placeholder="ΔX"
            onChange={(e) =>
              setDeltaPosition((pos) => ({
                ...pos,
                x: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <Input
            type="number"
            value={deltaPosition.y}
            placeholder="ΔY"
            onChange={(e) =>
              setDeltaPosition((pos) => ({
                ...pos,
                y: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <Input
            type="number"
            value={deltaPosition.z}
            placeholder="ΔZ"
            onChange={(e) =>
              setDeltaPosition((pos) => ({
                ...pos,
                z: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <Input
            type="number"
            value={deltaPosition.p}
            placeholder="ΔP"
            onChange={(e) =>
              setDeltaPosition((pos) => ({
                ...pos,
                p: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <Input
            type="number"
            value={deltaPosition.r}
            placeholder="ΔR"
            onChange={(e) =>
              setDeltaPosition((pos) => ({
                ...pos,
                r: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <Input
            type="number"
            value={interpolatePoints}
            placeholder="Interpolate Points"
            onChange={(e) =>
              setInterpolatePoints(parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <Button
          onClick={() =>
            moveDelta(
              deltaPosition,
              interpolatePoints > 0 ? interpolatePoints : undefined
            ).catch((error) => {
              console.error("Failed to move delta:", error);
            })
          }
          className="w-full"
          disabled={!isConnected}
          variant="outline"
        >
          Move Delta
        </Button>
      </div>
    </PanelCard>
  );
};

export default PositionPanel;
