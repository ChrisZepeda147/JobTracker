(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/preferences/job-preferences-form.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobPreferencesForm",
    ()=>JobPreferencesForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/textarea.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tag$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tag-input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$run$2d$reevaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/run-reevaluate.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
const emptyPrefs = (userId)=>({
        user_id: userId,
        target_roles: [],
        salary_min: null,
        salary_preferred: null,
        salary_max: null,
        max_preferred_experience_years: null,
        preferred_locations: [],
        remote_allowed: true,
        hybrid_allowed: true,
        onsite_allowed: true,
        home_zip: null,
        max_commute_miles: 50,
        excluded_seniority: [],
        excluded_keywords: [],
        additional_instructions: "",
        search_sources: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_SEARCH_SOURCES"]
        ],
        posted_within_days: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_POSTED_WITHIN_DAYS"],
        strict_filtering: true
    });
function JobPreferencesForm({ userId }) {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        ...emptyPrefs(userId)
    });
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reevaluateAfterSave, setReevaluateAfterSave] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savedSalaryMin, setSavedSalaryMin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savedSalaryMax, setSavedSalaryMax] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobPreferencesForm.useEffect": ()=>{
            async function load() {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                const { data } = await supabase.from("job_preferences").select("*").eq("user_id", userId).maybeSingle();
                if (data) {
                    const prefs = data;
                    setForm({
                        ...prefs,
                        posted_within_days: prefs.posted_within_days ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_POSTED_WITHIN_DAYS"],
                        strict_filtering: prefs.strict_filtering !== false,
                        search_sources: prefs.search_sources?.length > 0 ? prefs.search_sources : [
                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_SEARCH_SOURCES"]
                        ]
                    });
                    setSavedSalaryMin(prefs.salary_min ?? null);
                    setSavedSalaryMax(prefs.salary_max ?? null);
                }
                setLoading(false);
            }
            load();
        }
    }["JobPreferencesForm.useEffect"], [
        userId
    ]);
    async function onSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        setError(null);
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const { error: saveError } = await supabase.from("job_preferences").upsert({
            ...form,
            user_id: userId
        });
        if (saveError) {
            setSaving(false);
            setError(saveError.message);
            return;
        }
        const salaryChanged = form.salary_min !== savedSalaryMin || form.salary_max !== savedSalaryMax;
        setSavedSalaryMin(form.salary_min ?? null);
        setSavedSalaryMax(form.salary_max ?? null);
        setSaving(false);
        if (reevaluateAfterSave) {
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$run$2d$reevaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reevaluateStoredJobs"])(userId, {
                    wait: false
                });
                setMessage(salaryChanged ? `Preferences saved. ${result.message}` : `Preferences saved. ${result.message}`);
            } catch (reevaluateError) {
                setMessage("Preferences saved.");
                setError(reevaluateError instanceof Error ? `Saved, but re-evaluation failed: ${reevaluateError.message}` : "Saved, but re-evaluation failed.");
            }
        } else {
            setMessage("Preferences saved. Use Re-evaluate jobs now on the Jobs page when you want to update stored results.");
        }
    }
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-sm text-muted",
        children: "Loading preferences..."
    }, void 0, false, {
        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
        lineNumber: 124,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: onSubmit,
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tag$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TagInput"], {
                        label: "Target roles",
                        value: form.target_roles,
                        onChange: (target_roles)=>setForm({
                                ...form,
                                target_roles
                            }),
                        placeholder: "Full Stack Engineer, Backend Engineer"
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted",
                        children: "Saved per account. New searches and filter updates always read these values — nothing is hardcoded. Another user can set a different salary range."
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-4 md:grid-cols-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "salary_min",
                                        children: "Salary min"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "salary_min",
                                        type: "number",
                                        min: 0,
                                        value: form.salary_min ?? "",
                                        onChange: (e)=>setForm({
                                                ...form,
                                                salary_min: e.target.value ? Number(e.target.value) : null
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "salary_preferred",
                                        children: "Salary preferred"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 155,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "salary_preferred",
                                        type: "number",
                                        min: 0,
                                        value: form.salary_preferred ?? "",
                                        onChange: (e)=>setForm({
                                                ...form,
                                                salary_preferred: e.target.value ? Number(e.target.value) : null
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 156,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "salary_max",
                                        children: "Salary max"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 170,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "salary_max",
                                        type: "number",
                                        min: 0,
                                        value: form.salary_max ?? "",
                                        onChange: (e)=>setForm({
                                                ...form,
                                                salary_max: e.target.value ? Number(e.target.value) : null
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 171,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted",
                        children: "Example band: $50k min / $130k max / ~$80–85k preferred. Overlapping ranges are kept (e.g. $68k–$130k). Unlisted pay stays visible as unknown. Only pay entirely outside your range is rejected. Re-evaluate after saving to update stored jobs."
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "posted_within_days",
                                children: "Show listings posted within"
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "posted_within_days",
                                className: "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm",
                                value: form.posted_within_days ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_POSTED_WITHIN_DAYS"],
                                onChange: (e)=>setForm({
                                        ...form,
                                        posted_within_days: Number(e.target.value)
                                    }),
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POSTED_WITHIN_OPTIONS"].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: opt.value,
                                        children: opt.label
                                    }, opt.value, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 199,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 190,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-muted",
                                children: 'New searches only fetch jobs this fresh. Older stored jobs stay hidden on the Jobs page unless you turn on "Show older listings" there.'
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "max_preferred_experience_years",
                                children: "Max preferred experience (years)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 211,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "max_preferred_experience_years",
                                type: "number",
                                min: 0,
                                value: form.max_preferred_experience_years ?? "",
                                onChange: (e)=>setForm({
                                        ...form,
                                        max_preferred_experience_years: e.target.value ? Number(e.target.value) : null
                                    })
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "mt-2 flex items-center gap-2 text-sm text-zinc-700",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: form.strict_filtering !== false,
                                        onChange: (e)=>setForm({
                                                ...form,
                                                strict_filtering: e.target.checked
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 225,
                                        columnNumber: 13
                                    }, this),
                                    "Strict filtering (quality over quantity — hydrate postings, reject senior/management, verify listings)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tag$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TagInput"], {
                        label: "Preferred locations",
                        value: form.preferred_locations,
                        onChange: (preferred_locations)=>setForm({
                                ...form,
                                preferred_locations
                            }),
                        placeholder: "Austin, TX"
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-4 md:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "home_zip",
                                        children: "Home zip code"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 243,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "home_zip",
                                        inputMode: "numeric",
                                        maxLength: 10,
                                        placeholder: "78701",
                                        value: form.home_zip ?? "",
                                        onChange: (e)=>setForm({
                                                ...form,
                                                home_zip: e.target.value.trim() || null
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-xs text-muted",
                                        children: "Used to calculate commute distance for hybrid and on-site roles."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "max_commute_miles",
                                        children: "Max commute distance"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "max_commute_miles",
                                        className: "flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm",
                                        value: form.max_commute_miles ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ONSITE_MILES_OPTIONS"][3].value,
                                        onChange: (e)=>setForm({
                                                ...form,
                                                max_commute_miles: Number(e.target.value)
                                            }),
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ONSITE_MILES_OPTIONS"].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: option.value,
                                                children: option.label
                                            }, option.value, false, {
                                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                                lineNumber: 269,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 258,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-3",
                        children: [
                            [
                                "remote_allowed",
                                "Remote"
                            ],
                            [
                                "hybrid_allowed",
                                "Hybrid"
                            ],
                            [
                                "onsite_allowed",
                                "On-site"
                            ]
                        ].map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: form[key],
                                        onChange: (e)=>setForm({
                                                ...form,
                                                [key]: e.target.checked
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                        lineNumber: 286,
                                        columnNumber: 15
                                    }, this),
                                    label
                                ]
                            }, key, true, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tag$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TagInput"], {
                        label: "Excluded seniority",
                        value: form.excluded_seniority,
                        onChange: (excluded_seniority)=>setForm({
                                ...form,
                                excluded_seniority
                            }),
                        placeholder: "Intern, Junior"
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 296,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tag$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TagInput"], {
                        label: "Excluded keywords",
                        value: form.excluded_keywords,
                        onChange: (excluded_keywords)=>setForm({
                                ...form,
                                excluded_keywords
                            }),
                        placeholder: "clearance, unpaid"
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 303,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "additional_instructions",
                                children: "Additional instructions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 311,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "additional_instructions",
                                rows: 4,
                                value: form.additional_instructions,
                                onChange: (e)=>setForm({
                                        ...form,
                                        additional_instructions: e.target.value
                                    }),
                                placeholder: "Prioritize product companies, avoid contract roles..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                                lineNumber: 312,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 310,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                lineNumber: 322,
                columnNumber: 16
            }, this) : null,
            message ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-emerald-700",
                children: message
            }, void 0, false, {
                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                lineNumber: 323,
                columnNumber: 18
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center gap-2 text-sm text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: reevaluateAfterSave,
                        onChange: (e)=>setReevaluateAfterSave(e.target.checked)
                    }, void 0, false, {
                        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                        lineNumber: 326,
                        columnNumber: 9
                    }, this),
                    "After saving, update my existing jobs in the background (does not block save)"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "submit",
                disabled: saving,
                children: saving ? "Saving..." : "Save preferences"
            }, void 0, false, {
                fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
                lineNumber: 334,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/preferences/job-preferences-form.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(JobPreferencesForm, "JicHtNkL+0nUqKMc+MzFKasSaUA=");
_c = JobPreferencesForm;
var _c;
__turbopack_context__.k.register(_c, "JobPreferencesForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardDescription",
    ()=>CardDescription,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-border bg-card p-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mb-4 space-y-1", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-base font-semibold text-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 21,
        columnNumber: 10
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 25,
        columnNumber: 10
    }, this);
}
_c3 = CardDescription;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Input;
Input.displayName = "Input";
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mb-1.5 block text-sm font-medium text-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/label.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = Label;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/tag-input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TagInput",
    ()=>TagInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function TagInput({ label, value, onChange, placeholder, hint }) {
    _s();
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    function addTag(raw) {
        const tag = raw.trim();
        if (!tag || value.includes(tag)) return;
        onChange([
            ...value,
            tag
        ]);
        setDraft("");
    }
    function onKeyDown(event) {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(draft);
        }
        if (event.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "mb-1.5 block text-sm font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/ui/tag-input.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-border bg-white px-3 py-2 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 flex flex-wrap gap-2",
                        children: value.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onChange(value.filter((t)=>t !== tag)),
                                className: "inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200",
                                children: [
                                    tag,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": true,
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/tag-input.tsx",
                                        lineNumber: 47,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, tag, true, {
                                fileName: "[project]/src/components/ui/tag-input.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/tag-input.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: draft,
                        onChange: (e)=>setDraft(e.target.value),
                        onKeyDown: onKeyDown,
                        onBlur: ()=>addTag(draft),
                        placeholder: placeholder ?? "Type and press Enter",
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full border-0 bg-transparent text-sm outline-none")
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/tag-input.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/tag-input.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            hint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-xs text-muted",
                children: hint
            }, void 0, false, {
                fileName: "[project]/src/components/ui/tag-input.tsx",
                lineNumber: 60,
                columnNumber: 15
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/tag-input.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(TagInput, "gHCBSv/yb0KbDhJakBLSyTMaewQ=");
_c = TagInput;
var _c;
__turbopack_context__.k.register(_c, "TagInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/textarea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
;
const Textarea = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/textarea.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Textarea;
Textarea.displayName = "Textarea";
var _c, _c1;
__turbopack_context__.k.register(_c, "Textarea$forwardRef");
__turbopack_context__.k.register(_c1, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_POSTED_WITHIN_DAYS",
    ()=>DEFAULT_POSTED_WITHIN_DAYS,
    "DEFAULT_SEARCH_SOURCES",
    ()=>DEFAULT_SEARCH_SOURCES,
    "IMPLEMENTED_SEARCH_SOURCES",
    ()=>IMPLEMENTED_SEARCH_SOURCES,
    "JOB_SOURCES",
    ()=>JOB_SOURCES,
    "JOB_TABS",
    ()=>JOB_TABS,
    "MAX_SEARCH_TITLES",
    ()=>MAX_SEARCH_TITLES,
    "ONSITE_MILES_OPTIONS",
    ()=>ONSITE_MILES_OPTIONS,
    "POSTED_WITHIN_OPTIONS",
    ()=>POSTED_WITHIN_OPTIONS,
    "RECOMMENDED_MIN_SCORE",
    ()=>RECOMMENDED_MIN_SCORE,
    "SKIP_REASONS",
    ()=>SKIP_REASONS,
    "TOP_MATCHES_LIMIT",
    ()=>TOP_MATCHES_LIMIT
]);
const MAX_SEARCH_TITLES = 5;
const JOB_SOURCES = [
    {
        id: "linkedin",
        label: "LinkedIn"
    },
    {
        id: "indeed",
        label: "Indeed"
    },
    {
        id: "zip_recruiter",
        label: "ZipRecruiter"
    },
    {
        id: "wellfound",
        label: "Wellfound"
    },
    {
        id: "builtin",
        label: "Built In"
    },
    {
        id: "company_career_pages",
        label: "Company Career Pages"
    }
];
const DEFAULT_SEARCH_SOURCES = [
    "linkedin",
    "indeed",
    "builtin"
];
const IMPLEMENTED_SEARCH_SOURCES = new Set([
    "linkedin",
    "indeed",
    "builtin",
    "zip_recruiter",
    "wellfound",
    "company_career_pages"
]);
const POSTED_WITHIN_OPTIONS = [
    {
        value: 1,
        label: "24 hours"
    },
    {
        value: 3,
        label: "3 days"
    },
    {
        value: 7,
        label: "7 days"
    },
    {
        value: 14,
        label: "2 weeks"
    },
    {
        value: 21,
        label: "3 weeks (default)"
    },
    {
        value: 30,
        label: "1 month"
    },
    {
        value: 60,
        label: "2 months"
    }
];
const DEFAULT_POSTED_WITHIN_DAYS = 21;
const ONSITE_MILES_OPTIONS = [
    {
        value: 10,
        label: "10 miles"
    },
    {
        value: 20,
        label: "20 miles"
    },
    {
        value: 40,
        label: "40 miles"
    },
    {
        value: 50,
        label: "50 miles"
    },
    {
        value: 100,
        label: "100 miles"
    }
];
const JOB_TABS = [
    {
        id: "new",
        label: "New"
    },
    {
        id: "new_remote",
        label: "New Remote"
    },
    {
        id: "recommended",
        label: "Recommended"
    },
    {
        id: "apply_later",
        label: "Apply Later"
    },
    {
        id: "needs_decision",
        label: "Needs Decision"
    },
    {
        id: "applied",
        label: "Applied"
    },
    {
        id: "skipped",
        label: "Skipped"
    }
];
const SKIP_REASONS = [
    {
        id: "salary_too_low",
        label: "Salary too low"
    },
    {
        id: "salary_too_high",
        label: "Salary too high"
    },
    {
        id: "too_senior",
        label: "Too senior"
    },
    {
        id: "experience_requirement",
        label: "Experience requirement"
    },
    {
        id: "wrong_location",
        label: "Wrong location"
    },
    {
        id: "tech_stack",
        label: "Tech stack"
    },
    {
        id: "education_requirement",
        label: "Education requirement"
    },
    {
        id: "employment_type",
        label: "Employment type"
    },
    {
        id: "company",
        label: "Company"
    },
    {
        id: "not_interested",
        label: "Not interested"
    },
    {
        id: "other",
        label: "Other"
    }
];
const RECOMMENDED_MIN_SCORE = 75;
const TOP_MATCHES_LIMIT = 15;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/maintenance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "queueJobRescore",
    ()=>queueJobRescore,
    "queuePreferenceRefilter",
    ()=>queuePreferenceRefilter,
    "queueReevaluateStoredJobs",
    ()=>queueReevaluateStoredJobs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
;
async function queuePreferenceRefilter(userId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("job_search_requests").insert({
        user_id: userId,
        query: "",
        titles: [],
        location: "",
        sources: [],
        refilter_only: true,
        status: "pending"
    });
    if (error) {
        throw new Error(error.message);
    }
}
async function queueJobRescore(userId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from("job_search_requests").insert({
        user_id: userId,
        query: "",
        titles: [],
        location: "",
        sources: [],
        rescore_only: true,
        status: "pending"
    });
    if (error) {
        throw new Error(error.message);
    }
}
async function queueReevaluateStoredJobs(userId) {
    await queuePreferenceRefilter(userId);
    await queueJobRescore(userId);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/run-reevaluate.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reevaluateStoredJobs",
    ()=>reevaluateStoredJobs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$maintenance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/maintenance.ts [app-client] (ecmascript)");
;
async function reevaluateStoredJobs(userId, options = {}) {
    const wait = options.wait ?? false;
    const url = wait ? "/api/jobs/reevaluate?sync=1" : "/api/jobs/reevaluate";
    try {
        const res = await fetch(url, {
            method: "POST"
        });
        if (res.status === 501) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$maintenance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queueReevaluateStoredJobs"])(userId);
            return {
                mode: "queued",
                message: "Re-evaluation queued. Start the job worker (npm run search or search:worker) to apply updates."
            };
        }
        if (res.status === 202) {
            const data = await res.json();
            return {
                mode: "background",
                message: data.message ?? "Re-evaluation started in the background. Refresh Jobs in a few minutes."
            };
        }
        if (!res.ok) {
            const body = await res.json().catch(()=>({}));
            throw new Error(body.error ?? `Re-evaluate failed (${res.status})`);
        }
        const data = await res.json();
        return {
            mode: "immediate",
            refiltered: data.refiltered,
            rescored: data.rescored,
            message: `Updated ${data.refiltered} job filter(s) and re-scored ${data.rescored} job(s). Refresh complete.`
        };
    } catch (err) {
        if (err instanceof TypeError) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$maintenance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queueReevaluateStoredJobs"])(userId);
            return {
                mode: "queued",
                message: "Re-evaluation queued (could not reach local API)."
            };
        }
        throw err;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0jzx2nk._.js.map