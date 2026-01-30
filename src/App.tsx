import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type KeyboardEventHandler,
} from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import { buildScene, formatYears } from "./layout-core";
import type {
  Person,
  Gender,
  ViewerToggles,
  ExcalidrawAPI,
} from "./layout-core";
import "@excalidraw/excalidraw/index.css";
import "./App.css";

const STORAGE_KEY = "family-tree-data";

const STARTING_FAMILY: Person[] = [
  {
    id: 1,
    name: "Samira (Grandparent)",
    parentId: null,
    gender: "female",
    birthYear: 1948,
    deathYear: null,
    description: "Family matriarch who loves gardening.",
  },
  {
    id: 2,
    name: "Layla",
    parentId: 1,
    gender: "female",
    birthYear: 1975,
    deathYear: null,
    description: "Teacher who bakes on weekends.",
  },
  {
    id: 3,
    name: "Yousef",
    parentId: 1,
    gender: "male",
    birthYear: 1972,
    deathYear: null,
    description: "Engineer and chess fan.",
  },
  {
    id: 4,
    name: "Omar",
    parentId: 2,
    gender: "male",
    birthYear: 2000,
    deathYear: null,
    description: "Studying computer science.",
  },
  {
    id: 5,
    name: "Mina",
    parentId: 2,
    gender: "female",
    birthYear: 2003,
    deathYear: null,
    description: "Artist who sketches everywhere.",
  },
  {
    id: 6,
    name: "Sara",
    parentId: 3,
    gender: "female",
    birthYear: 2005,
    deathYear: null,
    description: "Soccer midfielder with big dreams.",
  },
];

const createInitialNextId = (people: Person[]) =>
  people.length ? Math.max(...people.map((p) => p.id)) + 1 : 1;

const clampParentIds = (people: Person[]) => {
  const ids = new Set<number>(people.map((p) => p.id));
  return people.map((person) => ({
    ...person,
    parentId:
      typeof person.parentId === "number" && ids.has(person.parentId)
        ? person.parentId
        : null,
  }));
};

const parseNumberId = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseGender = (value: unknown): Gender =>
  value === "male" || value === "female" ? value : "male";

const parseYear = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseDescription = (value: unknown) => String(value ?? "").trim();

const normalizePeople = (
  input: unknown[],
  seedNextId: number,
): { people: Person[]; nextId: number } => {
  let tempNextId = seedNextId;

  const mapped: Person[] = input
    .map((entry) => {
      const obj =
        entry && typeof entry === "object"
          ? (entry as Record<string, unknown>)
          : {};
      const id = parseNumberId(obj.id) ?? tempNextId++;
      const parentId = parseNumberId(obj.parentId);
      return {
        id,
        name: String(obj.name ?? "").trim(),
        parentId,
        gender: parseGender(obj.gender),
        birthYear: parseYear(obj.birthYear),
        deathYear: parseYear(obj.deathYear),
        description: parseDescription(obj.description),
      };
    })
    .filter((p) => p.name);

  const cleaned = clampParentIds(mapped);
  const maxId = cleaned.length ? Math.max(...cleaned.map((p) => p.id)) : 0;
  const nextId = Math.max(tempNextId, maxId + 1, 1);

  return { people: cleaned, nextId };
};

function App() {
  const nextIdRef = useRef<number>(createInitialNextId(STARTING_FAMILY));
  const [family, setFamily] = useState<Person[]>(() => {
    if (typeof window === "undefined") return STARTING_FAMILY;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return STARTING_FAMILY;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return STARTING_FAMILY;

      const { people, nextId } = normalizePeople(parsed, nextIdRef.current);
      nextIdRef.current = nextId;
      return people;
    } catch (error) {
      console.warn("Failed to load saved family data:", error);
      return STARTING_FAMILY;
    }
  });
  const [nameInput, setNameInput] = useState("");
  const [genderInput, setGenderInput] = useState<Gender>("male");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [deathYearInput, setDeathYearInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [activePath, setActivePath] = useState<number[]>([]);
  const [importError, setImportError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewerToggles, setViewerToggles] = useState<ViewerToggles>({
    showGenderColor: true,
    showYears: true,
    showDescription: true,
  });
  const [editModalPersonId, setEditModalPersonId] = useState<number | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<Gender>("male");
  const [editBirth, setEditBirth] = useState("");
  const [editDeath, setEditDeath] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);

  const currentParentId = activePath[activePath.length - 1] ?? null;
  const personById = useMemo(
    () => new Map(family.map((p) => [p.id, p])),
    [family],
  );
  const currentChildren = useMemo(
    () => family.filter((p) => p.parentId === currentParentId),
    [family, currentParentId],
  );
  const sceneSkeleton = useMemo(
    () => buildScene(family, currentParentId, viewerToggles),
    [family, currentParentId, viewerToggles],
  );

  useEffect(() => {
    if (!api) return;

    const elements = convertToExcalidrawElements(sceneSkeleton, {
      regenerateIds: false,
    });

    api.updateScene({
      elements,
      appState: {
        viewModeEnabled: true,
        zenModeEnabled: false,
        gridSize: 12,
        theme: "dark",
      },
    });

    if (elements.length) {
      api.scrollToContent(elements, {
        fitToViewport: true,
        viewportZoomFactor: 0.8,
      });
    }
  }, [sceneSkeleton, api]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
    } catch (error) {
      console.warn("Unable to persist family data:", error);
    }
  }, [family]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const addPerson = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    const newPerson: Person = {
      id: nextIdRef.current++,
      name: trimmed,
      parentId: currentParentId,
      gender: genderInput,
      birthYear: birthYearInput ? Number(birthYearInput) || null : null,
      deathYear: deathYearInput ? Number(deathYearInput) || null : null,
      description: descriptionInput.trim(),
    };

    setFamily((prev) => clampParentIds([...prev, newPerson]));
    setNameInput("");
    setGenderInput("male");
    setBirthYearInput("");
    setDeathYearInput("");
    setDescriptionInput("");
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addPerson();
    }
  };

  const exportTree = () => {
    const blob = new Blob([JSON.stringify(family, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "family-tree.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed))
          throw new Error("Expected an array of people");

        const { people, nextId } = normalizePeople(parsed, nextIdRef.current);
        nextIdRef.current = nextId;

        setFamily(people);
        setActivePath([]);
        setImportError("");
      } catch (error) {
        setImportError(
          error instanceof Error ? error.message : "Unable to read that file",
        );
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const clearTree = () => {
    if (clearConfirm.trim() !== "Clear") return;
    setFamily([]);
    setImportError("");
    setActivePath([]);
    nextIdRef.current = 1;
    setIsClearModalOpen(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Unable to clear saved data:", error);
      }
    }
    setClearConfirm("");
  };

  const openEditModal = (person: Person) => {
    setEditModalPersonId(person.id);
    setEditName(person.name);
    setEditGender(person.gender);
    setEditBirth(person.birthYear != null ? String(person.birthYear) : "");
    setEditDeath(person.deathYear != null ? String(person.deathYear) : "");
    setEditDesc(person.description);
  };

  const closeEditModal = () => {
    setEditModalPersonId(null);
    setEditName("");
    setEditBirth("");
    setEditDeath("");
    setEditDesc("");
  };

  const saveEdit = () => {
    if (editModalPersonId === null) return;
    const trimmed = editName.trim();
    if (!trimmed) return;

    setFamily((prev) =>
      prev.map((p) =>
        p.id === editModalPersonId
          ? {
              ...p,
              name: trimmed,
              gender: editGender,
              birthYear: editBirth ? Number(editBirth) || null : null,
              deathYear: editDeath ? Number(editDeath) || null : null,
              description: editDesc.trim(),
            }
          : p,
      ),
    );
    closeEditModal();
  };

  return (
    <div className="app">
      {isClearModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Confirm reset</h3>
            <p className="muted">
              This will remove everyone from the tree. Type <code>Clear</code>{" "}
              to confirm, or cancel to keep your data.
            </p>
            <label className="field">
              <span>Type “Clear”</span>
              <input
                type="text"
                autoFocus
                value={clearConfirm}
                onChange={(e) => setClearConfirm(e.target.value)}
              />
            </label>
            <div className="panel-actions">
              <button
                className="ghost"
                onClick={() => {
                  setIsClearModalOpen(false);
                  setClearConfirm("");
                }}
              >
                Cancel
              </button>
              <button
                className="ghost danger"
                onClick={clearTree}
                disabled={clearConfirm.trim() !== "Clear"}
              >
                Clear everything
              </button>
            </div>
          </div>
        </div>
      )}
      {editModalPersonId !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Edit person</h3>
            <div className="form">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>
              <div className="field">
                <span>Gender</span>
                <div className="choice-row">
                  {(["male", "female"] as Gender[]).map((option) => {
                    const isActive = editGender === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`choice-btn ${isActive ? "active" : ""}`}
                        onClick={() => setEditGender(option)}
                      >
                        {option === "male" ? "Male" : "Female"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field-inline">
                <label className="field-nested">
                  <span>Birth year</span>
                  <input
                    type="number"
                    value={editBirth}
                    onChange={(e) => setEditBirth(e.target.value)}
                  />
                </label>
                <label className="field-nested">
                  <span>Death year</span>
                  <input
                    type="number"
                    value={editDeath}
                    onChange={(e) => setEditDeath(e.target.value)}
                  />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </label>
            </div>
            <div className="panel-actions">
              <button className="ghost" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="primary" onClick={saveEdit}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      {isMenuOpen && (
        <div
          className="menu-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="menu-panel"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="menu-header">
              <h3>Controls</h3>
              <button
                className="ghost small icon-button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="menu-section">
              <p className="eyebrow">Data actions</p>
              <div className="panel-actions">
                <button
                  className="primary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                >
                  Import JSON
                </button>
                <button className="ghost" onClick={exportTree}>
                  Export JSON
                </button>
                <button
                  className="ghost danger"
                  onClick={() => {
                    setIsClearModalOpen(true);
                    setClearConfirm("");
                    setIsMenuOpen(false);
                  }}
                >
                  Start fresh
                </button>
              </div>
              {importError && <p className="error">{importError}</p>}
            </div>

            <div className="menu-section">
              <p className="eyebrow">Viewer options</p>
              <div className="toggle-list">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={viewerToggles.showGenderColor}
                    onChange={(e) =>
                      setViewerToggles((prev) => ({
                        ...prev,
                        showGenderColor: e.target.checked,
                      }))
                    }
                  />
                  <span>Show gender colors</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={viewerToggles.showYears}
                    onChange={(e) =>
                      setViewerToggles((prev) => ({
                        ...prev,
                        showYears: e.target.checked,
                      }))
                    }
                  />
                  <span>Show years</span>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={viewerToggles.showDescription}
                    onChange={(e) =>
                      setViewerToggles((prev) => ({
                        ...prev,
                        showDescription: e.target.checked,
                      }))
                    }
                  />
                  <span>Show description</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="layout">
        <div className="left-stack">
          <section className="panel mini-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">Add person</p>
                <h2>New relative</h2>
              </div>
            </div>
            <div className="form">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="ex. Noor"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>

              <div className="field">
                <span>Gender</span>
                <div className="choice-row">
                  {(["male", "female"] as Gender[]).map((option) => {
                    const isActive = genderInput === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`choice-btn ${isActive ? "active" : ""}`}
                        onClick={() => setGenderInput(option)}
                      >
                        {option === "male" ? "Male" : "Female"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field-inline">
                <label className="field-nested">
                  <span>Birth year</span>
                  <input
                    type="number"
                    placeholder="yyyy"
                    value={birthYearInput}
                    onChange={(e) => setBirthYearInput(e.target.value)}
                  />
                </label>
                <label className="field-nested">
                  <span>Death year</span>
                  <input
                    type="number"
                    placeholder="yyyy"
                    value={deathYearInput}
                    onChange={(e) => setDeathYearInput(e.target.value)}
                  />
                </label>
              </div>

              <label className="field">
                <span>Description</span>
                <input
                  type="text"
                  placeholder="Short note"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                />
              </label>

              <p className="muted">
                Parent:{" "}
                {currentParentId !== null
                  ? (personById.get(currentParentId)?.name ?? "Unknown")
                  : "Root"}
              </p>

              <button className="primary" onClick={addPerson}>
                Add to tree
              </button>
            </div>
          </section>

          <section className="panel mini-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">People</p>
                <h2>Browse</h2>
              </div>
              <div className="stat-squares">
                <div className="stat-box">
                  <span className="stat-number">{currentChildren.length}</span>
                  <span className="stat-label">here</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{family.length}</span>
                  <span className="stat-label">total</span>
                </div>
              </div>
            </div>

            <div className="breadcrumb">
              <button
                className={`crumb ${activePath.length === 0 ? "active" : ""}`}
                onClick={() => setActivePath([])}
              >
                Root
              </button>
              {activePath.map((id, index) => {
                const person = personById.get(id);
                const label = person?.name ?? `#${id}`;
                const isLast = index === activePath.length - 1;
                const nextPath = activePath.slice(0, index + 1);
                return (
                  <span key={id} className="crumb-wrap">
                    <span className="crumb-sep">›</span>
                    <button
                      className={`crumb ${isLast ? "active" : ""}`}
                      onClick={() => setActivePath(nextPath)}
                    >
                      {label}
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="list">
              {family.length === 0 && (
                <p className="muted">
                  No people yet. Add someone or import JSON.
                </p>
              )}
              {currentChildren.length === 0 && family.length > 0 && (
                <p className="muted">No children at this level.</p>
              )}
              {currentChildren.map((person) => (
                <button
                  key={person.id}
                  className="list-row selectable"
                  onClick={() => setActivePath([...activePath, person.id])}
                >
                  <div className="list-left">
                    <p className="list-title">{person.name}</p>
                    <p className="muted">{formatYears(person)}</p>
                    <p className="muted small-text">
                      {person.description.trim() || "No description"}
                    </p>
                  </div>
                  <div className="row-actions">
                    <div className="stat-box tiny">
                      <span className="stat-number">
                        {family.filter((p) => p.parentId === person.id).length}
                      </span>
                      <span className="stat-label">children</span>
                    </div>
                    <button
                      className="ghost small icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(person);
                      }}
                      aria-label={`Edit ${person.name}`}
                      title={`Edit ${person.name}`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M12.9 3.6a1.5 1.5 0 1 1 2.12 2.12l-7.8 7.8-3.12.52.52-3.12 7.8-7.8Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m11.5 5 3 3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="panel canvas-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Excalidraw viewer</p>
              <h2>Live family diagram</h2>
            </div>
            <div className="section-actions">
              <span className="chip soft">Read-only</span>
              <button
                className="ghost small icon-button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                title="Options"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                className="ghost small icon-button"
                onClick={() => setIsFullscreen(true)}
                aria-label="Enter full screen"
                title="Enter full screen"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M7 3H3v4M3 13v4h4M17 7V3h-4M13 17h4v-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className={`canvas-shell ${isFullscreen ? "fullscreen" : ""}`}>
            {isFullscreen && (
              <button
                className="ghost small icon-button exit-fullscreen"
                onClick={() => setIsFullscreen(false)}
                aria-label="Exit full screen"
                title="Exit full screen"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M7 5H5v2M5 13v2h2M15 7V5h-2M13 15h2v-2M7 7l-2-2m10 0-2 2m-6 6-2 2m12 0-2-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <Excalidraw
              viewModeEnabled
              theme="dark"
              UIOptions={{
                canvasActions: {
                  changeViewBackgroundColor: false,
                  clearCanvas: false,
                  loadScene: false,
                  saveToActiveFile: false,
                  toggleTheme: false,
                },
              }}
              onChange={() => {}}
              excalidrawAPI={(instance) => setApi(instance)}
            />
          </div>
        </section>
      </div>

      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        className="sr-only"
        onChange={handleFileSelect}
      />
    </div>
  );
}

export default App;
