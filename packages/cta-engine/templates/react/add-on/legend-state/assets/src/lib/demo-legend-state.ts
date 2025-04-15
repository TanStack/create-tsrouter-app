import { observable } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};
// Create an observable
export const todos$ = observable<Todo[]>([]);

// Persist the observable
syncObservable(todos$, {
  persist: {
    name: "demo-legend-state-todos",
    plugin: ObservablePersistLocalStorage,
  },
});
