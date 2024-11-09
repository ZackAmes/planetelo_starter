import { overridableComponent } from "@dojoengine/recs";
import type { ContractComponents, SessionDefinition } from "./typescript/models.gen";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({
    contractComponents,
}: {
    contractComponents: ContractComponents;
}) {
    return {
        ...contractComponents,
        Session: overridableComponent(contractComponents.Session),
        Guess: overridableComponent(contractComponents.Guess),

    };
}
