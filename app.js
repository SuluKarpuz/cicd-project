import express from "express";
import * as k8s from "@kubernetes/client-node";
import { version } from "./version.js";

const app = express();

const kc = new k8s.KubeConfig();
try {
  kc.loadFromDefault();
} catch (error) {
  console.log("Not running in a Kubernetes cluster");
}
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const getClusterInfo = async () => {
  try {
    const [nodes] = await Promise.all([k8sApi.listNode()]);

    return {
      status: "ok",
      clusterInfo: {
        nodes: nodes.body.items.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.log("Error:", error);
    return {
      status: "limited",
      message: "Limited cluster information available",
      timestamp: new Date().toISOString(),
    };
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Node.js!",
    version: version,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/cluster-info", async (req, res) => {
  const info = await getClusterInfo();
  res.json(info);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

export default app;
