import { MultilayerIjump } from "algos/multi-layer-ijump/MultilayerIjump"
import { test, expect } from "bun:test"
import { getDatasetGenerator } from "autorouting-dataset/lib/generators"
import { getSimpleRouteJson } from "solver-utils"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("repro3: remove wild trace jumps when continuing from non-wall stops", async () => {
  const generator = getDatasetGenerator("single-trace")
  const circuitJson = await generator.getExample({ seed: 18 })
  const input = getSimpleRouteJson(circuitJson, { layerCount: 2 })

  const autorouter = new MultilayerIjump({
    input,
    debug: true,
  })
  const solution = autorouter.solveAndMapToTraces()

  expect(solution).toHaveLength(1)
  const wirePoints = solution[0].route.filter((r) => r.route_type === "wire")
  // Should route directly without wild back-and-forth jumps inside A
  expect(wirePoints).toHaveLength(6)

  expect(
    convertCircuitJsonToPcbSvg(circuitJson.concat(solution as any) as any),
  ).toMatchSvgSnapshot(import.meta.path + "-pcb")
})
