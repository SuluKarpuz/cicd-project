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
    const [nodesResponse, namespacesResponse, podsResponse] = await Promise.all(
      [
        k8sApi.listNode(),
        k8sApi.listNamespace(),
        k8sApi.listPodForAllNamespaces(),
      ]
    );

    const nodes = nodesResponse.body.items.map((node) => ({
      name: node.metadata.name,
      kubeletVersion: node.status.nodeInfo.kubeletVersion,
      containerRuntime: node.status.nodeInfo.containerRuntimeVersion,
    }));

    const pods = podsResponse.body.items.map((pod) => ({
      name: pod.metadata.name,
      status: pod.status.phase,
    }));
    console.log("Nodes", nodes);
    console.log("Pods", pods);

    return {
      status: "ok",
      clusterInfo: {
        nodes: nodes.length,
        namespaces: namespacesResponse.body.items.length,
        podsInDefaultNamespace: pods.length,
        nodeDetails: nodes,
        runningPods: pods,
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
