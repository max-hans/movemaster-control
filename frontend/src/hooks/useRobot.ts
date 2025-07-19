import axios from "axios";
import { useCallback, useState } from "react";
import { useInterval } from "react-use";
import type { Position } from "@/lib/api";

interface GripPressureParams {
  startingGripForce: number;
  retainedGrippingForce: number;
  startGrippingForceRetentionTime: number;
}

interface RobotState {
  isConnected: boolean;
  position: Position | null;
  isGripperOpen: boolean;
  toolLength: number;
  speed: number;
}

const useRobot = () => {
  const [backendUrl, setBackendUrl] = useState("http://localhost:5123");

  const [robotState, setRobotState] = useState<RobotState>({
    isConnected: false,
    position: null,
    isGripperOpen: false,
    toolLength: -1,
    speed: -1,
  });
  const [serialports, setSerialports] = useState<string[]>([]);
  const connect = async (port: string) => {
    await axios.post(`${backendUrl}/connect`, { port });
    await queryUpdate();
  };

  const queryUpdate = useCallback(async () => {
    try {
      const status = await axios.get(`${backendUrl}/status`);
      const { isConnected, position, gripperOpen, toolLength, speed } =
        status.data;
      setRobotState({
        isConnected,
        position,
        isGripperOpen: gripperOpen,
        toolLength,
        speed,
      });
    } catch (error) {
      console.error("Failed to fetch robot status:", error);
      setRobotState({
        isConnected: false,
        position: null,
        isGripperOpen: false,
        toolLength: -1,
        speed: -1,
      });
    }
  }, [backendUrl]);

  useInterval(queryUpdate, 1000);

  const checkConnected = useCallback(() => {
    if (!robotState.isConnected) {
      throw new Error("Robot is not connected");
    }
  }, [robotState.isConnected]);

  const moveTo = useCallback(
    async (position: Position) => {
      checkConnected();
      const response = await axios.post(`${backendUrl}/move`, { position });
      setRobotState((prev) => ({ ...prev, position }));
      console.log("Robot moved to position:", position);
      return response.data;
    },
    [backendUrl, checkConnected]
  );

  const disconnect = useCallback(async () => {
    checkConnected();
    await axios.post(`${backendUrl}/disconnect`);
    setRobotState((prev) => ({ ...prev, isConnected: false }));
  }, [backendUrl, checkConnected]);

  const requestUpdatePosition = useCallback(async () => {
    if (!robotState.isConnected) {
      throw new Error("Robot is not connected");
    }
    await axios.get(`${backendUrl}/update-position`);
    await queryUpdate();
  }, [backendUrl, robotState.isConnected, queryUpdate]);

  const movePath = useCallback(
    async (positions: Position[]) => {
      checkConnected();

      await axios.post(`${backendUrl}/move-path`, {
        positions,
      });
    },
    [backendUrl, checkConnected]
  );

  const setGripper = async (open: boolean) => {
    checkConnected();
    await axios.post(`${backendUrl}/set-gripper`, { open });
    setRobotState((prev) => ({ ...prev, isGripperOpen: open }));
  };

  const updateToolLength = async (length: number) => {
    checkConnected();
    await axios.post(`${backendUrl}/set-tool-length`, { length });
    setRobotState((prev) => ({ ...prev, toolLength: length }));
  };

  const updateSpeed = useCallback(
    async (speed: number) => {
      checkConnected();
      await axios.post(`${backendUrl}/set-speed`, { speed });
      setRobotState((prev) => ({ ...prev, speed }));
    },
    [backendUrl, checkConnected]
  );

  const moveToHome = useCallback(async () => {
    checkConnected();
    await axios.post(`${backendUrl}/home`);
  }, [backendUrl, checkConnected]);

  const nest = useCallback(async () => {
    checkConnected();
    await axios.post(`${backendUrl}/nest`);
  }, [backendUrl, checkConnected]);

  const reset = useCallback(async () => {
    checkConnected();
    await axios.post(`${backendUrl}/reset`);
  }, [backendUrl, checkConnected]);

  const setGripPressure = useCallback(
    async (params: GripPressureParams) => {
      checkConnected();
      await axios.post(`${backendUrl}/set-grip-pressure`, params);
    },
    [backendUrl, checkConnected]
  );

  const rotateAxis = useCallback(
    async (position: Position) => {
      checkConnected();
      await axios.post(`${backendUrl}/rotate-axis`, { position });
    },
    [backendUrl, checkConnected]
  );

  const moveDelta = useCallback(
    async (position: Position, interpolatePoints?: number) => {
      checkConnected();
      await axios.post(`${backendUrl}/move-delta`, {
        position,
        interpolatePoints,
      });
    },
    [backendUrl, checkConnected]
  );

  const moveToXYZ = useCallback(
    async (
      position: { x: number; y: number; z: number },
      interpolatePoints?: number
    ) => {
      checkConnected();
      await axios.post(`${backendUrl}/move-to-xyz`, {
        position,
        interpolatePoints,
      });
    },
    [backendUrl, checkConnected]
  );

  const cleanUpRValue = useCallback(
    async (position: { x: number; y: number }, rTarget: number) => {
      checkConnected();
      const response = await axios.post(`${backendUrl}/clean-up-r-value`, {
        position,
        rTarget,
      });
      return response.data.cleanedR;
    },
    [backendUrl, checkConnected]
  );

  const getGripperClosed = useCallback(async () => {
    checkConnected();
    const response = await axios.get(`${backendUrl}/gripper-closed`);
    return response.data.closed;
  }, [backendUrl, checkConnected]);

  useInterval(
    async () => {
      try {
        const response = await axios.get(`${backendUrl}/serialports`);
        setSerialports(response.data.ports);
      } catch (error) {
        console.error("Error fetching serial ports:", error);
      }
    },
    !robotState.isConnected ? 1000 : null
  );

  return {
    setBackendUrl,
    connect,
    isConnected: robotState.isConnected,
    moveTo,
    disconnect,
    position: robotState.position,
    movePath,
    setGripper,
    isGripperOpen: robotState.isGripperOpen,
    updateToolLength,
    updateSpeed,
    requestUpdatePosition,
    serialports,
    toolLength: robotState.toolLength,
    speed: robotState.speed,
    // New functions matching backend API
    moveToHome,
    nest,
    reset,
    setGripPressure,
    rotateAxis,
    moveDelta,
    moveToXYZ,
    cleanUpRValue,
    getGripperClosed,
  };
};

export default useRobot;
