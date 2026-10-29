(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/jobs/job-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobCard",
    ()=>JobCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.mjs [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/listing-age.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$from$2d$text$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/salary-from-text.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
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
function JobCard({ job, highlighted = false, justApplied = false, onApply, onMarkApplied, onApplyLater, onSkip }) {
    const comp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$from$2d$text$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["effectiveJobSalary"])(job);
    const salaryFromText = job.salary_min == null && job.salary_max == null && (comp.min != null || comp.max != null);
    const salary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatSalaryRange"])(comp.min, comp.max);
    const posted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatListingAge"])(job);
    const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatSource"])(job.site);
    const workLocation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatWorkLocationLine"])(job, job.user_state?.commute_miles, job.user_state?.work_arrangement);
    const status = job.user_state?.status ?? "new";
    const needsDecision = status === "opened";
    const appliedAt = status === "applied" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatAppliedAt"])(job.user_state?.applied_at) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        id: `job-${job.id}`,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("scroll-mt-24 p-5 transition-all duration-500", highlighted && "ring-2 ring-accent ring-offset-2", justApplied && "border-accent/40 bg-indigo-50/80 shadow-md shadow-indigo-100"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold leading-snug",
                                children: job.title
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-card.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-sm font-medium text-zinc-700",
                                children: job.company || "Unknown company"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-card.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex shrink-0 flex-col items-end gap-1.5 self-start",
                        children: [
                            job.user_state?.is_stretch ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "muted",
                                className: "text-xs",
                                children: "Stretch"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-card.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this) : null,
                            job.match_score != null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "accent",
                                className: "text-sm",
                                children: [
                                    job.match_score,
                                    "% match"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/jobs/job-card.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-card.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted",
                children: [
                    salary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            salary,
                            salaryFromText ? " (from listing)" : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-zinc-500",
                        children: "Pay not listed"
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: workLocation
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    source ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: source
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 92,
                        columnNumber: 19
                    }, this) : null,
                    posted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: posted
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 93,
                        columnNumber: 19
                    }, this) : null,
                    job.experience_requirement ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: job.experience_requirement
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 94,
                        columnNumber: 39
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-card.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            job.fit_reason ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-sm leading-relaxed text-zinc-700",
                children: job.fit_reason
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-card.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this) : null,
            job.missing_skills && job.missing_skills.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex flex-wrap gap-1.5",
                children: job.missing_skills.map((skill)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "muted",
                        children: [
                            "Missing: ",
                            skill
                        ]
                    }, skill, true, {
                        fileName: "[project]/src/components/jobs/job-card.tsx",
                        lineNumber: 105,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-card.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 border-t border-border pt-4",
                children: needsDecision ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: "Did you apply to this job?"
                        }, void 0, false, {
                            fileName: "[project]/src/components/jobs/job-card.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>onMarkApplied(job),
                                    children: "Yes, Applied"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 118,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "secondary",
                                    onClick: ()=>onApplyLater(job),
                                    children: "Apply Later"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: ()=>onSkip(job),
                                    children: "No, Not a Fit"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/job-card.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/jobs/job-card.tsx",
                    lineNumber: 115,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap items-end justify-between gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-2",
                            children: [
                                status !== "applied" && status !== "skipped" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>onApply(job),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/jobs/job-card.tsx",
                                            lineNumber: 132,
                                            columnNumber: 19
                                        }, this),
                                        "Apply"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 131,
                                    columnNumber: 17
                                }, this) : null,
                                status === "new" || status === "recommended" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "secondary",
                                    onClick: ()=>onApplyLater(job),
                                    children: "Apply Later"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 137,
                                    columnNumber: 17
                                }, this) : null,
                                status !== "skipped" && status !== "applied" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: ()=>onSkip(job),
                                    children: "Skip"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 142,
                                    columnNumber: 17
                                }, this) : null,
                                job.job_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: job.job_url,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    className: "inline-flex items-center gap-1 self-center text-sm text-accent hover:underline",
                                    children: [
                                        "View posting",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/jobs/job-card.tsx",
                                            lineNumber: 154,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/jobs/job-card.tsx",
                                    lineNumber: 147,
                                    columnNumber: 17
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/job-card.tsx",
                            lineNumber: 129,
                            columnNumber: 13
                        }, this),
                        appliedAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "ml-auto shrink-0 text-xs text-muted",
                            children: [
                                "Applied ",
                                appliedAt
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/job-card.tsx",
                            lineNumber: 159,
                            columnNumber: 15
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/jobs/job-card.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-card.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/job-card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c = JobCard;
var _c;
__turbopack_context__.k.register(_c, "JobCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/jobs/job-preferences-summary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobPreferencesSummary",
    ()=>JobPreferencesSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.mjs [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/format.ts [app-client] (ecmascript)");
;
;
;
;
;
function formatWorkModes(prefs) {
    const modes = [];
    if (prefs.remote_allowed) modes.push("Remote");
    if (prefs.hybrid_allowed) modes.push("Hybrid");
    if (prefs.onsite_allowed) modes.push("On-site");
    return modes.length > 0 ? modes.join(" / ") : "None selected";
}
function formatCommute(prefs) {
    const zip = prefs.home_zip?.trim();
    const miles = prefs.max_commute_miles;
    if (zip && miles != null) return `${miles} mi from ${zip}`;
    if (zip) return `Home zip ${zip}`;
    if (miles != null) return `${miles} mi max commute`;
    return "Not set";
}
function formatList(values, emptyLabel = "None") {
    const trimmed = values.map((v)=>v.trim()).filter(Boolean);
    if (trimmed.length === 0) return emptyLabel;
    if (trimmed.length <= 2) return trimmed.join(", ");
    return `${trimmed.slice(0, 2).join(", ")} +${trimmed.length - 2} more`;
}
function formatSearchSources(prefs) {
    const ids = prefs.search_sources ?? [];
    if (ids.length === 0) return "None selected";
    const labels = ids.map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOB_SOURCES"].find((s)=>s.id === id)?.label ?? id).filter(Boolean);
    return labels.join(", ");
}
function formatLocation(prefs) {
    const city = prefs.preferred_locations?.[0]?.trim();
    const zip = prefs.home_zip?.trim();
    if (city && zip) return `${city} (${zip})`;
    if (city) return city;
    if (zip) return zip;
    return "Not set";
}
function PreferenceItem({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                className: "text-xs font-medium text-muted",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                className: "truncate text-sm font-medium text-foreground",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_c = PreferenceItem;
function JobPreferencesSummary({ preferences }) {
    if (!preferences) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-4 rounded-xl border border-dashed border-border bg-zinc-50 px-4 py-3 text-sm text-muted",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "No Job Preferences saved yet."
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/job-preferences",
                    className: "mt-1 inline-block font-medium text-accent hover:underline",
                    children: "Set up Job Preferences"
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-muted",
                    children: " — filters and search defaults come from there."
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this);
    }
    const salary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatSalaryRange"])(preferences.salary_min, preferences.salary_max) ?? "Not set";
    const experience = preferences.max_preferred_experience_years != null ? `${preferences.max_preferred_experience_years} years max` : "Not set";
    const listingFreshness = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POSTED_WITHIN_OPTIONS"].find((o)=>o.value === preferences.posted_within_days)?.label ?? (preferences.posted_within_days != null ? `${preferences.posted_within_days} days` : "3 weeks (default)");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-4 rounded-xl border border-border bg-zinc-50/80 px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-foreground",
                                children: "Active filters"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted",
                                children: [
                                    "Read-only here. Edit on",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/job-preferences",
                                        className: "font-medium text-accent hover:underline",
                                        children: "Job Preferences"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this),
                                    ", then use",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-foreground",
                                        children: "Re-evaluate jobs now"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                                        lineNumber: 99,
                                        columnNumber: 13
                                    }, this),
                                    " on the Jobs page (instant on localhost) to refresh filters and scores."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/job-preferences",
                        className: "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            "Edit preferences"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Job titles",
                        value: formatList(preferences.target_roles ?? [], "Not set")
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Location",
                        value: formatLocation(preferences)
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Search sources",
                        value: formatSearchSources(preferences)
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Salary range",
                        value: salary
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Commute",
                        value: formatCommute(preferences)
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Work modes",
                        value: formatWorkModes(preferences)
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Experience",
                        value: experience
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Listing age",
                        value: listingFreshness
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreferenceItem, {
                        label: "Excluded keywords",
                        value: formatList(preferences.excluded_keywords ?? [])
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/job-preferences-summary.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_c1 = JobPreferencesSummary;
var _c, _c1;
__turbopack_context__.k.register(_c, "PreferenceItem");
__turbopack_context__.k.register(_c1, "JobPreferencesSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/jobs/job-search-history.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobSearchHistory",
    ()=>JobSearchHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/format.ts [app-client] (ecmascript)");
"use client";
;
;
;
function statusLabel(status) {
    switch(status){
        case "pending":
            return "Queued";
        case "running":
            return "Running";
        case "completed":
            return "Completed";
        case "failed":
            return "Failed";
    }
}
function statusVariant(status) {
    if (status === "completed") return "accent";
    if (status === "failed") return "default";
    return "muted";
}
function titleSummary(request) {
    if (request.rescore_only) return "Rescore existing jobs";
    if (request.refilter_only) return "Apply location filter";
    const titles = request.titles?.length ? request.titles : request.query ? [
        request.query
    ] : [];
    if (titles.length === 0) return "Job search";
    if (titles.length === 1) return titles[0];
    return `${titles[0]} + ${titles.length - 1} more`;
}
function JobSearchHistory({ requests, loading }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mt-10 border-t border-border pt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold",
                        children: "Recent searches"
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-muted",
                        children: "Queued searches and their results."
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted",
                children: "Loading searches..."
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                lineNumber: 48,
                columnNumber: 18
            }, this) : null,
            !loading && requests.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-dashed border-border bg-zinc-50 px-6 py-8 text-center text-sm text-muted",
                children: "No searches yet. Use Search Jobs above to queue your first run."
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this) : null,
            !loading && requests.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-h-96 space-y-3 overflow-y-auto pr-1",
                children: requests.map((request)=>{
                    const location = request.location_zip ? `Zip ${request.location_zip}` : request.location || "Any location";
                    const sources = (request.sources ?? []).map((source)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatSource"])(source)).filter(Boolean).join(", ");
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-border bg-white px-4 py-3 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-start justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "truncate font-medium",
                                                children: titleSummary(request)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                                lineNumber: 74,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-sm text-muted",
                                                children: [
                                                    location,
                                                    sources ? ` · ${sources}` : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                                lineNumber: 75,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                        lineNumber: 73,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: statusVariant(request.status),
                                        children: statusLabel(request.status)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                        lineNumber: 80,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                lineNumber: 72,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatRelativeTime"])(request.created_at) ?? "Recently"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                        lineNumber: 84,
                                        columnNumber: 19
                                    }, this),
                                    request.status === "completed" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: request.rescore_only ? `${request.new_jobs_found} job(s) rescored` : request.refilter_only ? `${request.jobs_found} job(s) location-filtered` : `${request.new_jobs_found} new · ${request.jobs_found} valid total`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                        lineNumber: 86,
                                        columnNumber: 21
                                    }, this) : null,
                                    request.status === "failed" && request.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-600",
                                        children: request.error
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                        lineNumber: 95,
                                        columnNumber: 21
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                                lineNumber: 83,
                                columnNumber: 17
                            }, this)
                        ]
                    }, request.id, true, {
                        fileName: "[project]/src/components/jobs/job-search-history.tsx",
                        lineNumber: 68,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-search-history.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/job-search-history.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c = JobSearchHistory;
var _c;
__turbopack_context__.k.register(_c, "JobSearchHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/jobs/job-search-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobSearchPanel",
    ()=>JobSearchPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function validateSearchParams(form, scope) {
    const titles = form.titles.map((t)=>t.trim()).filter(Boolean);
    if (titles.length === 0) {
        return "Add at least one target role in Job Preferences.";
    }
    if (titles.length > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_SEARCH_TITLES"]) {
        return `Limit searches to ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_SEARCH_TITLES"]} titles in Job Preferences.`;
    }
    const zip = form.locationZip.trim();
    const city = form.location.trim();
    if (scope === "local" && !zip && !city) {
        return "Set a home zip or preferred location in Job Preferences.";
    }
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
        return "Home zip in Job Preferences must be 5 digits (optional +4 extension).";
    }
    if (form.sources.length === 0) {
        return "Select at least one job source.";
    }
    return null;
}
function JobSearchPanel({ searchParams, onSubmit, onSourcesChange, onReevaluate, reevaluatePending = false, lastRequestMessage }) {
    _s();
    const [sources, setSources] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(searchParams.sources);
    const [postedWithinDays, setPostedWithinDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(searchParams.postedWithinDays);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobSearchPanel.useEffect": ()=>{
            setSources(searchParams.sources);
        }
    }["JobSearchPanel.useEffect"], [
        searchParams.sources
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobSearchPanel.useEffect": ()=>{
            setPostedWithinDays(searchParams.postedWithinDays);
        }
    }["JobSearchPanel.useEffect"], [
        searchParams.postedWithinDays
    ]);
    const formWithSources = {
        ...searchParams,
        sources,
        postedWithinDays
    };
    const localValidationError = validateSearchParams(formWithSources, "local");
    const remoteValidationError = validateSearchParams(formWithSources, "remote_us");
    function toggleSource(sourceId) {
        setSources((prev)=>{
            const next = prev.includes(sourceId) ? prev.filter((id)=>id !== sourceId) : [
                ...prev,
                sourceId
            ];
            void onSourcesChange?.(next);
            return next;
        });
    }
    async function handleSearch(scope) {
        const validationError = scope === "local" ? localValidationError : remoteValidationError;
        if (validationError) return;
        setLoading(true);
        setError(null);
        try {
            await onSubmit(formWithSources, scope);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Search request failed.");
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-4 space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-xs font-medium text-muted",
                        children: "Search sources"
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOB_SOURCES"].map((source)=>{
                            const active = sources.includes(source.id);
                            const hint = source.id === "wellfound" ? "May be blocked without PROXY_LIST; worker tries best-effort" : source.id === "company_career_pages" ? "Greenhouse company boards (public API)" : undefined;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                title: hint,
                                onClick: ()=>toggleSource(source.id),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", active ? "bg-indigo-50 text-accent ring-1 ring-accent/30" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"),
                                children: source.label
                            }, source.id, false, {
                                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                                lineNumber: 104,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted",
                children: [
                    "Use up to ",
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_SEARCH_TITLES"],
                    " titles per search (set in Job Preferences). Queue separate searches for core SWE, frontend, backend, AI, and integration roles rather than one mega-search."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "flex items-center gap-2 text-xs font-medium text-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Posted within"
                        }, void 0, false, {
                            fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            className: "rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-foreground",
                            value: postedWithinDays,
                            onChange: (e)=>setPostedWithinDays(Number(e.target.value)),
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POSTED_WITHIN_OPTIONS"].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: opt.value,
                                    children: opt.label
                                }, opt.value, false, {
                                    fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                                    lineNumber: 137,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        disabled: Boolean(localValidationError) || loading,
                        onClick: ()=>void handleSearch("local"),
                        className: "shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                                lineNumber: 152,
                                columnNumber: 11
                            }, this),
                            loading ? "Queuing..." : "Local / commute search"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "secondary",
                        disabled: Boolean(remoteValidationError) || loading,
                        onClick: ()=>void handleSearch("remote_us"),
                        className: "shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this),
                            loading ? "Queuing..." : "US remote search"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this),
                    onReevaluate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "secondary",
                        disabled: reevaluatePending,
                        onClick: ()=>void onReevaluate(),
                        className: "shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            reevaluatePending ? "Re-evaluating jobs..." : "Re-evaluate jobs now"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this) : null,
                    localValidationError || error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-600",
                        children: localValidationError ?? error
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 180,
                        columnNumber: 11
                    }, this) : null,
                    !localValidationError && lastRequestMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-emerald-700",
                        children: lastRequestMessage
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/job-search-panel.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/job-search-panel.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_s(JobSearchPanel, "YPp5Q3eY9lBO9mmnOCORW12IOoU=");
_c = JobSearchPanel;
var _c;
__turbopack_context__.k.register(_c, "JobSearchPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/jobs/jobs-board.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobsBoard",
    ()=>JobsBoard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/jobs/job-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$search$2d$history$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/jobs/job-search-history.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$preferences$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/jobs/job-preferences-summary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$search$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/jobs/job-search-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$skip$2d$reason$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/jobs/skip-reason-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/listing-age.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$fetch$2d$user$2d$jobs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/fetch-user-jobs.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/jobs/logic.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$location$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/location-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$run$2d$reevaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/run-reevaluate.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/salary-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
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
;
;
;
;
;
function JobsBoard({ userId, preferences, focusJobId = null }) {
    _s();
    const [jobs, setJobs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("new");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchMessage, setSearchMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchRequests, setSearchRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchesLoading, setSearchesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [skipTarget, setSkipTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [highlightedJobId, setHighlightedJobId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [includeOlderListings, setIncludeOlderListings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reevaluateRunning, setReevaluateRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const searchDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[searchDefaults]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["defaultsFromPreferences"])(preferences)
    }["JobsBoard.useMemo[searchDefaults]"], [
        preferences
    ]);
    const excludedKeywords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[excludedKeywords]": ()=>(preferences?.excluded_keywords ?? []).map({
                "JobsBoard.useMemo[excludedKeywords]": (k)=>k.trim()
            }["JobsBoard.useMemo[excludedKeywords]"]).filter(Boolean)
    }["JobsBoard.useMemo[excludedKeywords]"], [
        preferences
    ]);
    const salaryPrefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[salaryPrefs]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["salaryPrefsFromPreferences"])(preferences)
    }["JobsBoard.useMemo[salaryPrefs]"], [
        preferences
    ]);
    const locationPrefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[locationPrefs]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$location$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["locationPrefsFromPreferences"])(preferences)
    }["JobsBoard.useMemo[locationPrefs]"], [
        preferences
    ]);
    const maxPreferredExperienceYears = preferences?.max_preferred_experience_years ?? null;
    const listingAgePrefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[listingAgePrefs]": ()=>({
                maxAgeDays: preferences?.posted_within_days ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_POSTED_WITHIN_DAYS"],
                includeOlder: includeOlderListings
            })
    }["JobsBoard.useMemo[listingAgePrefs]"], [
        preferences?.posted_within_days,
        includeOlderListings
    ]);
    const hiddenOlderCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[hiddenOlderCount]": ()=>jobs.filter({
                "JobsBoard.useMemo[hiddenOlderCount]": (job)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isListingTooOld"])(job, {
                        maxAgeDays: listingAgePrefs.maxAgeDays,
                        includeOlder: false
                    })
            }["JobsBoard.useMemo[hiddenOlderCount]"]).length
    }["JobsBoard.useMemo[hiddenOlderCount]"], [
        jobs,
        listingAgePrefs.maxAgeDays
    ]);
    const maintenancePending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[maintenancePending]": ()=>searchRequests.some({
                "JobsBoard.useMemo[maintenancePending]": (request)=>(request.rescore_only || request.refilter_only) && (request.status === "pending" || request.status === "running")
            }["JobsBoard.useMemo[maintenancePending]"])
    }["JobsBoard.useMemo[maintenancePending]"], [
        searchRequests
    ]);
    const loadSearchRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "JobsBoard.useCallback[loadSearchRequests]": async ()=>{
            setSearchesLoading(true);
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { data, error: searchError } = await supabase.from("job_search_requests").select("*").eq("user_id", userId).order("created_at", {
                ascending: false
            }).limit(50);
            if (!searchError) {
                setSearchRequests(data ?? []);
            }
            setSearchesLoading(false);
        }
    }["JobsBoard.useCallback[loadSearchRequests]"], [
        userId
    ]);
    const loadJobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "JobsBoard.useCallback[loadJobs]": async ()=>{
            setError(null);
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { jobs, error: loadError } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$fetch$2d$user$2d$jobs$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchUserJobRecords"])(supabase, userId);
            if (loadError) {
                setError(loadError);
            } else {
                setJobs(jobs);
            }
            setLoading(false);
        }
    }["JobsBoard.useCallback[loadJobs]"], [
        userId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobsBoard.useEffect": ()=>{
            loadJobs();
            loadSearchRequests();
        }
    }["JobsBoard.useEffect"], [
        loadJobs,
        loadSearchRequests
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobsBoard.useEffect": ()=>{
            if (!maintenancePending) {
                return;
            }
            const timer = window.setInterval({
                "JobsBoard.useEffect.timer": ()=>{
                    void loadSearchRequests();
                    void loadJobs();
                }
            }["JobsBoard.useEffect.timer"], 5000);
            return ({
                "JobsBoard.useEffect": ()=>window.clearInterval(timer)
            })["JobsBoard.useEffect"];
        }
    }["JobsBoard.useEffect"], [
        maintenancePending,
        loadJobs,
        loadSearchRequests
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobsBoard.useEffect": ()=>{
            if (!focusJobId || loading || jobs.length === 0) {
                return;
            }
            const job = jobs.find({
                "JobsBoard.useEffect.job": (entry)=>entry.id === focusJobId
            }["JobsBoard.useEffect.job"]);
            if (!job) {
                return;
            }
            for (const tab of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOB_TABS"]){
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobMatchesTab"])(job, tab.id, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences)) {
                    setActiveTab(tab.id);
                    break;
                }
            }
            requestAnimationFrame({
                "JobsBoard.useEffect": ()=>{
                    document.getElementById(`job-${focusJobId}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }["JobsBoard.useEffect"]);
        }
    }["JobsBoard.useEffect"], [
        focusJobId,
        loading,
        jobs,
        excludedKeywords,
        salaryPrefs,
        maxPreferredExperienceYears,
        locationPrefs,
        listingAgePrefs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobsBoard.useEffect": ()=>{
            if (!highlightedJobId || activeTab !== "needs_decision") {
                return;
            }
            requestAnimationFrame({
                "JobsBoard.useEffect": ()=>{
                    document.getElementById(`job-${highlightedJobId}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }["JobsBoard.useEffect"]);
        }
    }["JobsBoard.useEffect"], [
        highlightedJobId,
        activeTab
    ]);
    function clearHighlightIfResolved(jobId) {
        setHighlightedJobId((current)=>current === jobId ? null : current);
    }
    const pinJobId = activeTab === "needs_decision" ? highlightedJobId : null;
    const visibleJobs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[visibleJobs]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sortJobsForTab"])(jobs.filter({
                "JobsBoard.useMemo[visibleJobs]": (job)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jobMatchesTab"])(job, activeTab, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences)
            }["JobsBoard.useMemo[visibleJobs]"]), activeTab, pinJobId)
    }["JobsBoard.useMemo[visibleJobs]"], [
        jobs,
        activeTab,
        excludedKeywords,
        salaryPrefs,
        maxPreferredExperienceYears,
        locationPrefs,
        listingAgePrefs,
        pinJobId,
        preferences
    ]);
    const tabCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JobsBoard.useMemo[tabCounts]": ()=>Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOB_TABS"].map({
                "JobsBoard.useMemo[tabCounts]": (t)=>[
                        t.id,
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["countForTab"])(jobs, t.id, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences)
                    ]
            }["JobsBoard.useMemo[tabCounts]"]))
    }["JobsBoard.useMemo[tabCounts]"], [
        jobs,
        excludedKeywords,
        salaryPrefs,
        maxPreferredExperienceYears,
        locationPrefs,
        listingAgePrefs,
        preferences
    ]);
    async function upsertState(jobId, patch) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const existing = jobs.find((j)=>j.id === jobId)?.user_state;
        if (existing) {
            const { error: saveError } = await supabase.from("user_job_states").update(patch).eq("user_id", userId).eq("job_id", jobId);
            if (saveError) throw new Error(saveError.message);
        } else {
            const { error: saveError } = await supabase.from("user_job_states").insert({
                user_id: userId,
                job_id: jobId,
                status: "new",
                ...patch
            });
            if (saveError) throw new Error(saveError.message);
        }
        await loadJobs();
    }
    async function handleSourcesChange(sources) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        if (preferences) {
            const { error } = await supabase.from("job_preferences").update({
                search_sources: sources
            }).eq("user_id", userId);
            if (error) throw new Error(error.message);
            return;
        }
        const { error } = await supabase.from("job_preferences").insert({
            user_id: userId,
            target_roles: [],
            preferred_locations: [],
            remote_allowed: true,
            hybrid_allowed: true,
            onsite_allowed: false,
            excluded_seniority: [],
            excluded_keywords: [],
            additional_instructions: "",
            search_sources: sources
        });
        if (error) throw new Error(error.message);
    }
    async function handleSearch(form, scope) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const titles = form.titles.map((t)=>t.trim()).filter(Boolean);
        const isRemoteUs = scope === "remote_us";
        const { error: insertError } = await supabase.from("job_search_requests").insert({
            user_id: userId,
            query: titles[0] ?? "",
            titles,
            location: isRemoteUs ? "United States" : form.location.trim(),
            location_zip: isRemoteUs ? null : form.locationZip.trim() || null,
            salary_min: form.salaryMin ? Number(form.salaryMin) : null,
            salary_max: form.salaryMax ? Number(form.salaryMax) : null,
            posted_within_days: form.postedWithinDays,
            remote_allowed: true,
            hybrid_allowed: isRemoteUs ? false : form.hybridAllowed,
            onsite_allowed: isRemoteUs ? false : form.onsiteAllowed,
            max_onsite_miles: !isRemoteUs && (form.hybridAllowed || form.onsiteAllowed) ? form.maxOnsiteMiles : null,
            sources: form.sources,
            nationwide_remote: isRemoteUs,
            status: "pending"
        });
        if (insertError) throw new Error(insertError.message);
        setSearchMessage(isRemoteUs ? "US remote search queued. Results will appear shortly." : "Local / commute search queued. Results will appear shortly.");
        await loadSearchRequests();
    }
    async function handleReevaluate() {
        if (maintenancePending || reevaluateRunning) {
            setSearchMessage("A re-evaluation is already in progress.");
            return;
        }
        setReevaluateRunning(true);
        setSearchMessage("Starting re-evaluation…");
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$run$2d$reevaluate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reevaluateStoredJobs"])(userId, {
                wait: false
            });
            setSearchMessage(result.message);
            if (result.mode === "queued") {
                await loadSearchRequests();
            }
            if (result.mode === "background") {
                window.setTimeout(()=>void loadJobs(), 90_000);
                window.setTimeout(()=>void loadJobs(), 180_000);
            } else {
                await loadJobs();
            }
        } catch (err) {
            setSearchMessage(err instanceof Error ? err.message : "Re-evaluation failed.");
        } finally{
            setReevaluateRunning(false);
        }
    }
    async function handleApply(job) {
        window.open(job.job_url, "_blank", "noopener,noreferrer");
        const clickedAt = new Date().toISOString();
        setHighlightedJobId(job.id);
        setActiveTab("needs_decision");
        setJobs((prev)=>prev.map((entry)=>entry.id === job.id ? {
                    ...entry,
                    user_state: {
                        ...entry.user_state ?? {
                            user_id: userId,
                            job_id: job.id,
                            skip_reason: null,
                            user_notes: "",
                            commute_miles: null,
                            work_arrangement: null,
                            location_status: null,
                            salary_status: null,
                            keyword_status: null,
                            experience_status: null,
                            education_status: null,
                            created_at: clickedAt,
                            updated_at: clickedAt
                        },
                        status: "opened",
                        apply_clicked_at: clickedAt
                    }
                } : entry));
        await upsertState(job.id, {
            status: "opened",
            apply_clicked_at: clickedAt
        });
    }
    async function handleMarkApplied(job) {
        await upsertState(job.id, {
            status: "applied",
            applied_at: new Date().toISOString()
        });
        clearHighlightIfResolved(job.id);
        setActiveTab("applied");
    }
    async function handleApplyLater(job) {
        await upsertState(job.id, {
            status: "apply_later"
        });
        clearHighlightIfResolved(job.id);
        if (activeTab !== "needs_decision") {
            setActiveTab("apply_later");
        }
    }
    async function handleSkipConfirm(reason, notes) {
        if (!skipTarget) return;
        const patch = {
            status: "skipped",
            skip_reason: reason,
            user_notes: notes
        };
        if (reason === "salary_too_low" || reason === "salary_too_high") {
            patch.salary_status = "rejected";
        }
        await upsertState(skipTarget.id, patch);
        clearHighlightIfResolved(skipTarget.id);
        setSkipTarget(null);
        setActiveTab("skipped");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                title: "Jobs",
                description: "Browse matches, track applications, and queue new searches."
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 420,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$preferences$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobPreferencesSummary"], {
                preferences: preferences
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "find-jobs",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$search$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobSearchPanel"], {
                    searchParams: searchDefaults,
                    onSubmit: handleSearch,
                    onSourcesChange: handleSourcesChange,
                    onReevaluate: handleReevaluate,
                    reevaluatePending: maintenancePending || reevaluateRunning,
                    lastRequestMessage: searchMessage
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/jobs-board.tsx",
                    lineNumber: 428,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 427,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted",
                        children: [
                            "Hiding listings older than ",
                            listingAgePrefs.maxAgeDays,
                            " days",
                            hiddenOlderCount > 0 ? ` (${hiddenOlderCount} hidden)` : "",
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 439,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                className: "rounded border-border",
                                checked: includeOlderListings,
                                onChange: (e)=>setIncludeOlderListings(e.target.checked)
                            }, void 0, false, {
                                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                                lineNumber: 444,
                                columnNumber: 11
                            }, this),
                            "Show older listings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 443,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 438,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4 flex gap-1 overflow-x-auto border-b border-border pb-px",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOB_TABS"].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            setActiveTab(tab.id);
                            if (tab.id !== "needs_decision") {
                                setHighlightedJobId(null);
                            }
                        },
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors", activeTab === tab.id ? "border-b-2 border-accent bg-white text-accent" : "text-muted hover:text-foreground"),
                        children: [
                            tab.label,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1.5 text-xs text-muted",
                                children: [
                                    "(",
                                    tabCounts[tab.id],
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                                lineNumber: 473,
                                columnNumber: 13
                            }, this)
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 456,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 454,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted",
                children: "Loading jobs..."
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 478,
                columnNumber: 18
            }, this) : null,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 479,
                columnNumber: 16
            }, this) : null,
            !loading && !error && visibleJobs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-dashed border-border bg-zinc-50 px-6 py-12 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium",
                        children: "No jobs in this category"
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 483,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-muted",
                        children: activeTab === "new" ? "Run npm run search to start the app and worker, then queue a search above." : activeTab === "new_remote" ? "Remote US jobs from your searches will appear here after the worker runs." : "Jobs will appear here as you interact with listings."
                    }, void 0, false, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 484,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 482,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: visibleJobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobCard"], {
                        job: job,
                        highlighted: focusJobId === job.id || highlightedJobId === job.id,
                        justApplied: highlightedJobId === job.id,
                        onApply: handleApply,
                        onMarkApplied: handleMarkApplied,
                        onApplyLater: handleApplyLater,
                        onSkip: setSkipTarget
                    }, job.id, false, {
                        fileName: "[project]/src/components/jobs/jobs-board.tsx",
                        lineNumber: 496,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 494,
                columnNumber: 7
            }, this),
            skipTarget ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$skip$2d$reason$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SkipReasonDialog"], {
                jobTitle: skipTarget.title,
                onConfirm: handleSkipConfirm,
                onCancel: ()=>setSkipTarget(null)
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 510,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$jobs$2f$job$2d$search$2d$history$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JobSearchHistory"], {
                requests: searchRequests,
                loading: searchesLoading
            }, void 0, false, {
                fileName: "[project]/src/components/jobs/jobs-board.tsx",
                lineNumber: 517,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/jobs/jobs-board.tsx",
        lineNumber: 419,
        columnNumber: 5
    }, this);
}
_s(JobsBoard, "AH77YEG5IojLL+tG4Hw1R3YwRb0=");
_c = JobsBoard;
var _c;
__turbopack_context__.k.register(_c, "JobsBoard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/jobs/skip-reason-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SkipReasonDialog",
    ()=>SkipReasonDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/textarea.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function SkipReasonDialog({ jobTitle, onConfirm, onCancel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-base font-semibold",
                    children: "Not a fit — why skip?"
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-1 text-sm text-muted line-clamp-2",
                    children: jobTitle
                }, void 0, false, {
                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    className: "mt-4 space-y-4",
                    onSubmit: (e)=>{
                        e.preventDefault();
                        const form = e.currentTarget;
                        const reason = form.elements.namedItem("skip_reason").value;
                        const notes = form.elements.namedItem("skip_notes").value;
                        onConfirm(reason, notes);
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: "skip_reason",
                                    children: "Reason"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: "skip_reason",
                                    name: "skip_reason",
                                    required: true,
                                    className: "mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
                                    defaultValue: "",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            disabled: true,
                                            children: "Select a reason"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                            lineNumber: 39,
                                            columnNumber: 15
                                        }, this),
                                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SKIP_REASONS"].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: r.id,
                                                children: r.label
                                            }, r.id, false, {
                                                fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                                lineNumber: 43,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: "skip_notes",
                                    children: "Notes (optional)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 50,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                    id: "skip_notes",
                                    name: "skip_notes",
                                    rows: 3,
                                    placeholder: "Any extra detail..."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    variant: "secondary",
                                    onClick: onCancel,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "submit",
                                    variant: "danger",
                                    children: "Skip job"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/jobs/skip-reason-dialog.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = SkipReasonDialog;
var _c;
__turbopack_context__.k.register(_c, "SkipReasonDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
;
;
function Badge({ children, className, variant = "default" }) {
    const styles = {
        default: "bg-zinc-100 text-zinc-700",
        accent: "bg-indigo-50 text-indigo-700",
        muted: "bg-zinc-50 text-muted border border-border"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[variant], className),
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
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
"[project]/src/lib/jobs/education-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isEducationBlocked",
    ()=>isEducationBlocked,
    "requiresCsDegree",
    ()=>requiresCsDegree
]);
/** Hard CS-degree requirement detection (mirrors job_engine.education_filter). */ const CS_DEGREE_REQUIRED = [
    /\b(?:bachelor(?:'s)?|b\.s\.|bs)\b[^.\n]{0,80}\b(?:in|of)\b[^.\n]{0,40}\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b/i,
    /\bdegree\s+in\s+(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i,
    /\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\s+degree\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i,
    /\bcs\s+major\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i
];
const SOFT_EDUCATION = /\b(?:preferred|plus|nice to have|or equivalent|equivalent experience)\b/i;
function requiresCsDegree(job) {
    const haystack = [
        job.title,
        job.description
    ].filter(Boolean).join("\n");
    if (!haystack.trim()) return false;
    for (const pattern of CS_DEGREE_REQUIRED){
        const match = pattern.exec(haystack);
        if (!match) continue;
        const start = Math.max(0, match.index - 40);
        const end = match.index + match[0].length + 80;
        const window = haystack.slice(start, end);
        if (SOFT_EDUCATION.test(window)) continue;
        return true;
    }
    return false;
}
function isEducationBlocked(job) {
    if (job.user_state?.education_status === "rejected") {
        return true;
    }
    return requiresCsDegree(job);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/experience-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractRequiredYears",
    ()=>extractRequiredYears,
    "extractRequiredYearsForJob",
    ()=>extractRequiredYearsForJob,
    "isExperienceOverPreference",
    ()=>isExperienceOverPreference,
    "isExperienceUnknownBlockedStrict",
    ()=>isExperienceUnknownBlockedStrict
]);
/** Client-side experience requirement check (mirrors Python experience_filter). */ const EXPERIENCE_PATTERNS = [
    /(\d{1,2})\s*\+?\s*years?\s+of\s+(?:[\w\s,./-]{0,60})?(?:experience|exp\.?)\b/i,
    /(?:minimum|min\.?|at least|least)\s+(\d{1,2})\s*\+?\s*years?\b/i,
    /(\d{1,2})\s*[-–]\s*\d{1,2}\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,40})?(?:experience|exp\.?)\b/i,
    /(\d{1,2})\s*\+?\s*years?\s+(?:of\s+)?(?:professional|software|relevant|industry|work)\b/i,
    /(\d{1,2})\s*\+?\s*years?\s+(?:in|with)\s+(?:[\w\s,./-]{1,40})\b/i,
    /(\d{1,2})\+\s*(?:years?|yrs?)\b/i,
    /(?:experience|qualifications|requirements)\s*[:\-]\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i,
    /(\d{1,2})\s*to\s*\d{1,2}\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp\.?)\b/i
];
const TITLE_IMPLICIT_YOE = [
    {
        pattern: /\b(?:principal|distinguished)\b/i,
        years: 10
    },
    {
        pattern: /\bstaff\b/i,
        years: 8
    },
    {
        pattern: /\b(?:senior|sr\.?)\b/i,
        years: 5
    }
];
const MAX_REASONABLE_YOE = 25;
const MAX_HAYSTACK_CHARS = 50_000;
const MAX_MATCHES_PER_PATTERN = 50;
function normalizeExperienceText(text) {
    return text.replace(/\\\+/g, "+").replace(/\\-/g, "-").replace(/\\\*/g, "*").replace(/\\_/g, "_");
}
function globalPattern(pattern) {
    return pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
}
function extractRequiredYears(text) {
    if (!text.trim()) return null;
    const normalized = normalizeExperienceText(text.slice(0, MAX_HAYSTACK_CHARS));
    const found = [];
    for (const pattern of EXPERIENCE_PATTERNS){
        const matcher = globalPattern(pattern);
        let matchCount = 0;
        for (const match of normalized.matchAll(matcher)){
            const years = Number.parseInt(match[1] ?? "", 10);
            if (years >= 1 && years <= MAX_REASONABLE_YOE) {
                found.push(years);
            }
            matchCount += 1;
            if (matchCount >= MAX_MATCHES_PER_PATTERN) {
                break;
            }
        }
    }
    if (found.length === 0) return null;
    return Math.max(...found);
}
function inferRequiredYearsFromTitle(title) {
    const inferred = [];
    for (const rule of TITLE_IMPLICIT_YOE){
        if (rule.pattern.test(title)) {
            inferred.push(rule.years);
        }
    }
    if (inferred.length === 0) return null;
    return Math.max(...inferred);
}
function extractRequiredYearsForJob(job) {
    const haystack = normalizeExperienceText([
        job.title,
        job.description ?? ""
    ].filter(Boolean).join("\n"));
    const fromText = extractRequiredYears(haystack);
    const fromTitle = inferRequiredYearsFromTitle(job.title);
    const candidates = [
        fromText,
        fromTitle
    ].filter((value)=>value != null);
    if (candidates.length === 0) return null;
    return Math.max(...candidates);
}
function isExperienceOverPreference(job, maxPreferredYears) {
    if (maxPreferredYears == null) return false;
    const required = extractRequiredYearsForJob(job);
    if (required == null) return false;
    return required > maxPreferredYears;
}
function isExperienceUnknownBlockedStrict(job, maxPreferredYears, strict) {
    if (!strict || maxPreferredYears == null) return false;
    const haystack = [
        job.title,
        job.description ?? ""
    ].join("\n");
    const hydrationAttempted = haystack.trim().length >= 120 || Boolean(job.description?.trim());
    if (!hydrationAttempted) return false;
    return extractRequiredYearsForJob(job) == null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/fetch-user-jobs.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JOB_LIST_SELECT",
    ()=>JOB_LIST_SELECT,
    "USER_STATE_SELECT",
    ()=>USER_STATE_SELECT,
    "fetchUserJobRecords",
    ()=>fetchUserJobRecords
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/jobs/logic.ts [app-client] (ecmascript) <locals>");
;
const JOB_LIST_SELECT = "id, job_hash, title, company, location, job_url, site, salary_min, salary_max, posted_date, match_score, fit_reason, missing_skills, experience_requirement, scored_by, last_seen_at";
const USER_STATE_SELECT = "user_id, job_id, status, apply_clicked_at, applied_at, skip_reason, user_notes, commute_miles, work_arrangement, location_status, salary_status, keyword_status, experience_status, education_status, management_status, seniority_status, listing_status, listing_checked_at, listing_check_reason, filter_reason, is_stretch, created_at, updated_at";
const JOB_ID_CHUNK = 80;
async function fetchJobsByIds(supabase, jobIds) {
    if (jobIds.length === 0) return [];
    const rows = [];
    for(let i = 0; i < jobIds.length; i += JOB_ID_CHUNK){
        const chunk = jobIds.slice(i, i + JOB_ID_CHUNK);
        const { data, error } = await supabase.from("jobs").select(JOB_LIST_SELECT).in("id", chunk);
        if (error) throw error;
        for (const row of data ?? []){
            rows.push({
                ...row,
                description: ""
            });
        }
    }
    return rows;
}
async function fetchUserJobRecords(supabase, userId) {
    const { data: states, error: statesError } = await supabase.from("user_job_states").select(USER_STATE_SELECT).eq("user_id", userId);
    if (statesError) {
        return {
            jobs: [],
            error: statesError.message
        };
    }
    const userStates = states ?? [];
    const jobIds = [
        ...new Set(userStates.map((s)=>s.job_id))
    ];
    try {
        const jobRows = await fetchJobsByIds(supabase, jobIds);
        return {
            jobs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$logic$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mergeJobsWithStates"])(jobRows, userStates),
            error: null
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        return {
            jobs: [],
            error: message
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectWorkArrangement",
    ()=>detectWorkArrangement,
    "effectiveWorkArrangement",
    ()=>effectiveWorkArrangement,
    "formatAppliedAt",
    ()=>formatAppliedAt,
    "formatPostedDate",
    ()=>formatPostedDate,
    "formatRelativeTime",
    ()=>formatRelativeTime,
    "formatSalaryRange",
    ()=>formatSalaryRange,
    "formatSource",
    ()=>formatSource,
    "formatWorkLocationLine",
    ()=>formatWorkLocationLine,
    "sanitizeJobLocation",
    ()=>sanitizeJobLocation
]);
function formatSalaryRange(min, max) {
    if (min == null && max == null) return null;
    const fmt = (n)=>new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(n);
    if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
}
function formatPostedDate(value) {
    if (!value) return null;
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
function formatAppliedAt(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}
function formatSource(site) {
    if (!site) return null;
    const labels = {
        linkedin: "LinkedIn",
        indeed: "Indeed",
        zip_recruiter: "ZipRecruiter",
        wellfound: "Wellfound",
        builtin: "Built In",
        glassdoor: "Glassdoor",
        company_career_pages: "Company Career Pages"
    };
    return labels[site.toLowerCase()] ?? site.replace(/_/g, " ");
}
function formatRelativeTime(iso) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatPostedDate(iso);
}
const REMOTE_RE = /\b(remote|work from home|work-from-home|wfh|telecommute|distributed|anywhere|fully remote|remote-eligible|remote ok)\b/i;
const HYBRID_RE = /\b(hybrid|partially remote|flexible hybrid|\d+\s+days?\s+(?:a\s+week\s+)?in[- ]?office)\b/i;
const ONSITE_RE = /\b(on[- ]?site|in[- ]?office|in person|office[- ]based)\b/i;
const ARRANGEMENT_LINE_RE = /^\s*(remote|hybrid|on[- ]?site|onsite|in[- ]?office|in office)\s*$/im;
function sanitizeJobLocation(location) {
    let text = location.trim();
    if (text.includes("·")) {
        text = text.split("·", 1)[0].trim();
    }
    return text.replace(/,\s*(?:US|USA|U\.S\.A?\.?|United States(?: of America)?)\s*$/i, "").trim();
}
function workModeFromDescriptionLines(description) {
    if (!description) return null;
    const lines = description.split(/\r?\n/).slice(0, 30);
    for (const line of lines){
        const match = ARRANGEMENT_LINE_RE.exec(line.trim());
        if (!match) continue;
        const token = match[1].toLowerCase().replace(/\s+/g, "");
        if (token === "remote") return "Remote";
        if (token === "hybrid") return "Hybrid";
        if (token === "onsite" || token === "on-site" || token === "inoffice" || token === "in-office") {
            return "Onsite";
        }
    }
    return null;
}
const US_BROAD_LOCATION_RE = /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america)(?:\s*[-–—•|]\s*)?$/i;
function hasArrangementHint(text) {
    return REMOTE_RE.test(text) || HYBRID_RE.test(text) || ONSITE_RE.test(text);
}
function normalizeGeographicLocation(location) {
    const trimmed = location.trim();
    if (!trimmed) return "";
    return trimmed.replace(/,\s*(?:US|USA|U\.S\.A?\.?|United States(?: of America)?)\s*$/i, "").trim();
}
function detectWorkArrangement(job) {
    const fromLines = workModeFromDescriptionLines(job.description);
    if (fromLines) return fromLines;
    const location = sanitizeJobLocation(job.location || "");
    const normalizedLocation = normalizeGeographicLocation(location);
    const head = `${job.title}\n${(job.description || "").slice(0, 2500)}`;
    if (HYBRID_RE.test(location)) return "Hybrid";
    if (ONSITE_RE.test(location)) return "Onsite";
    if (REMOTE_RE.test(location)) {
        if (HYBRID_RE.test(head)) return "Hybrid";
        if (ONSITE_RE.test(head)) return "Onsite";
        return "Remote";
    }
    if (US_BROAD_LOCATION_RE.test(normalizedLocation) || US_BROAD_LOCATION_RE.test(location.trim())) {
        return "Remote";
    }
    const text = `${job.title}\n${job.description || ""}`.slice(0, 8000);
    if (HYBRID_RE.test(text)) return "Hybrid";
    if (ONSITE_RE.test(text)) return "Onsite";
    if (REMOTE_RE.test(text)) return "Remote";
    return "Unknown";
}
const STORED_ARRANGEMENT = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "Onsite",
    unknown: "Unknown"
};
function effectiveWorkArrangement(job, stored) {
    const key = stored?.trim().toLowerCase();
    if (key && key in STORED_ARRANGEMENT && key !== "unknown") {
        return STORED_ARRANGEMENT[key];
    }
    return detectWorkArrangement(job);
}
function stripArrangementPrefix(location, arrangement) {
    const trimmed = location.trim();
    if (!trimmed) return "";
    let geographic = trimmed;
    if (arrangement === "Remote") {
        geographic = trimmed.replace(/^remote\s*[-–—•|]\s*/i, "").trim() || trimmed;
    } else if (arrangement === "Hybrid") {
        geographic = trimmed.replace(/^hybrid\s*[-–—•|]\s*/i, "").trim() || trimmed;
    } else if (arrangement === "Onsite") {
        geographic = trimmed.replace(/^(?:on[- ]?site|in[- ]office)\s*[-–—•|]\s*/i, "").trim() || trimmed;
    }
    geographic = normalizeGeographicLocation(geographic);
    if (arrangement === "Unknown" && hasArrangementHint(geographic)) {
        geographic = geographic.replace(/\(\s*remote\s*\)/gi, "").replace(/\(\s*hybrid\s*\)/gi, "").replace(/\(\s*on[- ]?site\s*\)/gi, "").replace(/\bremote\s*[-–—•|]\s*/gi, "").replace(/\bhybrid\s*[-–—•|]\s*/gi, "").trim();
        geographic = normalizeGeographicLocation(geographic);
    }
    return geographic;
}
function formatWorkLocationLine(job, commuteMiles, storedArrangement) {
    const arrangement = effectiveWorkArrangement(job, storedArrangement);
    const geographic = stripArrangementPrefix(sanitizeJobLocation(job.location || ""), arrangement);
    if (arrangement === "Remote") {
        const geo = geographic.trim();
        const isBroad = !geo || US_BROAD_LOCATION_RE.test(geo) || /^(united states|usa|u\.?s\.?)$/i.test(geo);
        if (!isBroad) {
            return `Remote • ${geo} (verify on posting)`;
        }
        return "Remote • US (verify workplace on posting)";
    }
    if (arrangement === "Unknown") {
        if (geographic) {
            if (commuteMiles != null) {
                return `${geographic} • ${Math.round(commuteMiles)} miles`;
            }
            return geographic;
        }
        return commuteMiles != null ? `Location Unverified • ${Math.round(commuteMiles)} miles` : "Location Unverified";
    }
    if (!geographic) {
        if (commuteMiles != null && arrangement !== "Remote") {
            return `${arrangement} • ${Math.round(commuteMiles)} miles`;
        }
        return arrangement;
    }
    if (commuteMiles != null && arrangement !== "Remote") {
        return `${arrangement} • ${geographic} • ${Math.round(commuteMiles)} miles`;
    }
    return `${arrangement} • ${geographic}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/keyword-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isKeywordExcluded",
    ()=>isKeywordExcluded,
    "matchesExcludedKeywords",
    ()=>matchesExcludedKeywords
]);
/** Case-insensitive excluded keyword matching (mirrors Python keyword_filter). */ const TITLE_ONLY_KEYWORDS = new Set([
    "ii",
    "iii",
    "iv",
    "grad",
    "graduate",
    "graduation",
    "undergrad"
]);
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function compileKeywordPattern(keyword) {
    const trimmed = keyword.trim();
    const lower = trimmed.toLowerCase();
    const escaped = escapeRegex(trimmed);
    if (TITLE_ONLY_KEYWORDS.has(lower)) {
        return new RegExp(`\\b${escaped}\\b`, "i");
    }
    if (lower.length <= 4 && /^[a-z]+$/i.test(lower)) {
        return new RegExp(`\\b${escaped}(?:uate|uation|s)?\\b`, "i");
    }
    return new RegExp(`\\b${escaped}\\b`, "i");
}
function keywordHaystack(job, keyword) {
    const key = keyword.trim().toLowerCase();
    if (TITLE_ONLY_KEYWORDS.has(key)) {
        return [
            job.title,
            job.company ?? ""
        ].filter(Boolean).join("\n");
    }
    return [
        job.title,
        job.company ?? "",
        job.description ?? ""
    ].filter(Boolean).join("\n");
}
function matchesExcludedKeywords(job, keywords) {
    const seen = new Set();
    for (const raw of keywords){
        const keyword = raw.trim();
        if (!keyword) continue;
        const key = keyword.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const haystack = keywordHaystack(job, keyword);
        if (!haystack.trim()) continue;
        if (compileKeywordPattern(keyword).test(haystack)) {
            return keyword;
        }
    }
    return null;
}
function isKeywordExcluded(job, keywords) {
    return matchesExcludedKeywords(job, keywords) !== null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/listing-age.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_LISTING_AGE_DAYS",
    ()=>DEFAULT_MAX_LISTING_AGE_DAYS,
    "formatListingAge",
    ()=>formatListingAge,
    "isListingTooOld",
    ()=>isListingTooOld,
    "listingAgeDays",
    ()=>listingAgeDays
]);
const DEFAULT_MAX_LISTING_AGE_DAYS = 21;
const HISTORY_STATUSES = new Set([
    "applied",
    "skipped"
]);
function parseDate(value) {
    const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}
function listingAgeDays(job) {
    const posted = job.posted_date ? parseDate(job.posted_date) : null;
    const anchor = posted ?? (job.last_seen_at ? parseDate(job.last_seen_at) : null);
    if (!anchor) return null;
    const diffMs = Date.now() - anchor.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
function isListingTooOld(job, prefs) {
    if (prefs.includeOlder) return false;
    const status = job.user_state?.status ?? "new";
    if (HISTORY_STATUSES.has(status)) return false;
    const age = listingAgeDays(job);
    if (age == null) return false;
    return age > prefs.maxAgeDays;
}
function formatListingAge(job) {
    const age = listingAgeDays(job);
    if (age == null) return null;
    if (age <= 0) return "Posted today";
    if (age === 1) return "Posted 1 day ago";
    if (age < 14) return `Posted ${age} days ago`;
    if (age < 45) return `Posted ${Math.floor(age / 7)} weeks ago`;
    return `Posted ${Math.floor(age / 30)}+ months ago`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/location-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isLocationPolicyBlocked",
    ()=>isLocationPolicyBlocked,
    "locationPrefsFromPreferences",
    ()=>locationPrefsFromPreferences,
    "parseStateAbbr",
    ()=>parseStateAbbr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$remote$2d$contradiction$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/remote-contradiction.ts [app-client] (ecmascript)");
;
;
const STATE_ABBR_RE = /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;
function parseStateAbbr(location) {
    const match = STATE_ABBR_RE.exec((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sanitizeJobLocation"])(location));
    return match ? match[1].toUpperCase() : null;
}
function inferStateFromHomeZip(zip) {
    const digits = zip?.replace(/\D/g, "").slice(0, 5);
    if (!digits || digits.length < 3) return null;
    const prefix = Number(digits.slice(0, 3));
    if (prefix >= 900 && prefix <= 961) return "CA";
    return null;
}
function preferredStateFromPreferences(prefs) {
    for (const raw of prefs?.preferred_locations ?? []){
        const text = raw.trim();
        if (!text) continue;
        const abbr = parseStateAbbr(text);
        if (abbr) return abbr;
        if (/\bcalifornia\b/i.test(text)) return "CA";
    }
    return inferStateFromHomeZip(prefs?.home_zip);
}
function locationPrefsFromPreferences(prefs) {
    return {
        preferredState: preferredStateFromPreferences(prefs ?? null),
        maxCommuteMiles: prefs?.max_commute_miles ?? null,
        remoteAllowed: prefs?.remote_allowed ?? true,
        hybridAllowed: prefs?.hybrid_allowed ?? true,
        onsiteAllowed: prefs?.onsite_allowed ?? Boolean(prefs?.home_zip?.trim())
    };
}
function isFullyRemoteArrangement(arrangement) {
    return arrangement === "Remote";
}
function isLocationPolicyBlocked(job, locationPrefs) {
    if (job.user_state?.location_status === "rejected") {
        return true;
    }
    if (job.user_state?.location_status === "unverified") {
        return true;
    }
    const prefs = locationPrefs;
    const arrangement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["effectiveWorkArrangement"])(job, job.user_state?.work_arrangement);
    const locationLine = job.location ?? "";
    const jobState = parseStateAbbr(locationLine);
    const homeState = prefs?.preferredState ?? null;
    if (homeState && jobState && jobState !== homeState && !isFullyRemoteArrangement(arrangement)) {
        return true;
    }
    if (arrangement === "Hybrid" || arrangement === "Onsite" || arrangement === "Unknown" && jobState) {
        const maxMiles = prefs?.maxCommuteMiles;
        const commute = job.user_state?.commute_miles;
        if (maxMiles != null && commute != null && commute > maxMiles) {
            return true;
        }
        if (homeState && jobState && jobState !== homeState) {
            return true;
        }
    }
    if (arrangement === "Remote" && homeState && jobState && jobState !== homeState) {
        const maxMiles = prefs?.maxCommuteMiles;
        const commute = job.user_state?.commute_miles;
        if (maxMiles != null && commute != null && commute > maxMiles) {
            return true;
        }
    }
    if (isFullyRemoteArrangement(arrangement) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$remote$2d$contradiction$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remotePostingContradicted"])(job)) {
        return true;
    }
    if (job.user_state?.location_status === "pass") {
        if (isFullyRemoteArrangement(arrangement) && (!locationLine.trim() || BROAD_LOCATION_RE.test((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sanitizeJobLocation"])(locationLine)))) {
            return true;
        }
        return false;
    }
    return true;
}
const BROAD_LOCATION_RE = /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america|remote)$/i;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/logic.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareJobsByMatchScore",
    ()=>compareJobsByMatchScore,
    "countForTab",
    ()=>countForTab,
    "defaultsFromPreferences",
    ()=>defaultsFromPreferences,
    "effectiveStatus",
    ()=>effectiveStatus,
    "isDashboardTopMatch",
    ()=>isDashboardTopMatch,
    "isEducationBlockedForJob",
    ()=>isEducationBlockedForJob,
    "isExperienceBlocked",
    ()=>isExperienceBlocked,
    "isExperienceNeedsReview",
    ()=>isExperienceNeedsReview,
    "isKeywordBlocked",
    ()=>isKeywordBlocked,
    "isListingAgeBlocked",
    ()=>isListingAgeBlocked,
    "isListingClosedBlocked",
    ()=>isListingClosedBlocked,
    "isLocationBlocked",
    ()=>isLocationBlocked,
    "isLocationEligibleForActiveTabs",
    ()=>isLocationEligibleForActiveTabs,
    "isManagementBlockedForJob",
    ()=>isManagementBlockedForJob,
    "isPipelineBlocked",
    ()=>isPipelineBlocked,
    "isRemoteJob",
    ()=>isRemoteJob,
    "isSalaryBlocked",
    ()=>isSalaryBlocked,
    "isSeniorityTitleBlockedForJob",
    ()=>isSeniorityTitleBlockedForJob,
    "jobMatchesTab",
    ()=>jobMatchesTab,
    "mergeJobsWithStates",
    ()=>mergeJobsWithStates,
    "sortJobsByMatchScore",
    ()=>sortJobsByMatchScore,
    "sortJobsForTab",
    ()=>sortJobsForTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$keyword$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/keyword-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$education$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/education-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$experience$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/experience-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$management$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/management-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$strict$2d$mode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/strict-mode.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$location$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/location-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/salary-filter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/listing-age.ts [app-client] (ecmascript)");
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
;
const HISTORY_TAB_STATUSES = new Set([
    "applied",
    "skipped"
]);
function isLocationEligibleForActiveTabs(job) {
    return job.user_state?.location_status === "pass";
}
function isLocationBlocked(job, _forRecommended = false, locationPrefs) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    if (locationPrefs && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$location$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLocationPolicyBlocked"])(job, locationPrefs)) {
        return true;
    }
    return !isLocationEligibleForActiveTabs(job);
}
function isSalaryBlocked(job, salaryPrefs) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    if (job.user_state?.salary_status === "rejected") {
        return true;
    }
    if (salaryPrefs && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSalaryOutOfRange"])(job, salaryPrefs)) {
        return true;
    }
    return false;
}
function isExperienceNeedsReview(job) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    return job.user_state?.experience_status === "unknown";
}
function isExperienceBlocked(job, maxPreferredYears) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    if (job.user_state?.experience_status === "rejected") {
        return true;
    }
    if (maxPreferredYears != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$experience$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isExperienceOverPreference"])(job, maxPreferredYears)) {
        return true;
    }
    return false;
}
function isManagementBlockedForJob(job) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) return false;
    return job.user_state?.management_status === "rejected";
}
function isSeniorityTitleBlockedForJob(job, strict = true) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) return false;
    if (job.user_state?.seniority_status === "rejected") return true;
    if (!strict) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$management$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStrictSeniorityTitleBlocked"])(job.title);
}
function isListingClosedBlocked(job, strict = true) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) return false;
    if (job.user_state?.listing_status === "closed") return strict;
    return false;
}
function isEducationBlockedForJob(job) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$education$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isEducationBlocked"])(job);
}
function isKeywordBlocked(job, excludedKeywords = []) {
    const status = effectiveStatus(job.user_state);
    if (HISTORY_TAB_STATUSES.has(status)) {
        return false;
    }
    if (job.user_state?.keyword_status === "rejected") {
        return true;
    }
    if (excludedKeywords.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$keyword$2d$filter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchesExcludedKeywords"])(job, excludedKeywords)) {
        return true;
    }
    return false;
}
function isPipelineBlocked(job, forRecommended = false, excludedKeywords = [], salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences) {
    const strict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$strict$2d$mode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStrictFiltering"])(preferences);
    return isLocationBlocked(job, forRecommended, locationPrefs) || isSalaryBlocked(job, salaryPrefs) || isExperienceBlocked(job, maxPreferredExperienceYears, strict) || isManagementBlockedForJob(job, strict) || isSeniorityTitleBlockedForJob(job, strict) || isListingClosedBlocked(job, strict) || isEducationBlockedForJob(job) || isKeywordBlocked(job, excludedKeywords) || isListingAgeBlocked(job, listingAgePrefs);
}
;
function isDashboardTopMatch(job, excludedKeywords = [], salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences) {
    const status = effectiveStatus(job.user_state);
    if (status === "applied" || status === "skipped") {
        return false;
    }
    const strict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$strict$2d$mode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isStrictFiltering"])(preferences);
    return !isLocationBlocked(job, false, locationPrefs) && !isSalaryBlocked(job, salaryPrefs) && !isExperienceBlocked(job, maxPreferredExperienceYears, strict) && !isManagementBlockedForJob(job, strict) && !isSeniorityTitleBlockedForJob(job, strict) && !isListingClosedBlocked(job, strict) && !isEducationBlockedForJob(job) && !isKeywordBlocked(job, excludedKeywords) && !isListingAgeBlocked(job, listingAgePrefs);
}
function effectiveStatus(state) {
    return state?.status ?? "new";
}
function isRemoteJob(job) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["effectiveWorkArrangement"])(job, job.user_state?.work_arrangement) === "Remote";
}
function isListingAgeBlocked(job, listingAgePrefs) {
    if (!listingAgePrefs) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$listing$2d$age$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isListingTooOld"])(job, listingAgePrefs);
}
function matchesNewTab(job, remoteOnly, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences) {
    if (effectiveStatus(job.user_state) !== "new" || isPipelineBlocked(job, false, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences)) {
        return false;
    }
    return remoteOnly ? isRemoteJob(job) : !isRemoteJob(job);
}
function jobMatchesTab(job, tab, excludedKeywords = [], salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences) {
    const status = effectiveStatus(job.user_state);
    switch(tab){
        case "new":
            return matchesNewTab(job, false, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences);
        case "new_remote":
            return matchesNewTab(job, true, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences);
        case "recommended":
            return (job.match_score ?? 0) >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RECOMMENDED_MIN_SCORE"] && status !== "applied" && status !== "skipped" && !isPipelineBlocked(job, true, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences);
        case "apply_later":
            return status === "apply_later" && !isPipelineBlocked(job, false, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences);
        case "needs_decision":
            return status === "opened" && !isPipelineBlocked(job, false, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences);
        case "applied":
            return status === "applied";
        case "skipped":
            return status === "skipped";
        default:
            return false;
    }
}
function countForTab(jobs, tab, excludedKeywords = [], salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences) {
    return jobs.filter((job)=>jobMatchesTab(job, tab, excludedKeywords, salaryPrefs, maxPreferredExperienceYears, locationPrefs, listingAgePrefs, preferences)).length;
}
function compareJobsByMatchScore(a, b) {
    const stretchA = a.user_state?.is_stretch ? 1 : 0;
    const stretchB = b.user_state?.is_stretch ? 1 : 0;
    if (stretchA !== stretchB) return stretchA - stretchB;
    const scoreA = a.match_score ?? -1;
    const scoreB = b.match_score ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.last_seen_at ?? "").localeCompare(a.last_seen_at ?? "");
}
function sortJobsByMatchScore(jobs) {
    return [
        ...jobs
    ].sort(compareJobsByMatchScore);
}
function sortJobsForTab(jobs, tab, pinJobId = null) {
    if (tab === "needs_decision") {
        const sorted = [
            ...jobs
        ].sort((a, b)=>{
            const atA = a.user_state?.apply_clicked_at ?? "";
            const atB = b.user_state?.apply_clicked_at ?? "";
            if (atB !== atA) return atB.localeCompare(atA);
            return compareJobsByMatchScore(a, b);
        });
        if (!pinJobId) return sorted;
        const pinned = sorted.find((job)=>job.id === pinJobId);
        if (!pinned) return sorted;
        return [
            pinned,
            ...sorted.filter((job)=>job.id !== pinJobId)
        ];
    }
    if (tab === "applied") {
        return [
            ...jobs
        ].sort((a, b)=>{
            const atA = a.user_state?.applied_at ?? "";
            const atB = b.user_state?.applied_at ?? "";
            if (atA && atB && atB !== atA) return atB.localeCompare(atA);
            if (atA && !atB) return -1;
            if (!atA && atB) return 1;
            return compareJobsByMatchScore(a, b);
        });
    }
    return sortJobsByMatchScore(jobs);
}
function mergeJobsWithStates(jobs, states) {
    const stateMap = new Map(states.map((s)=>[
            s.job_id,
            s
        ]));
    return jobs.map((job)=>({
            ...job,
            user_state: stateMap.get(job.id)
        }));
}
function defaultsFromPreferences(prefs) {
    const savedSources = (prefs?.search_sources ?? []).map((s)=>s.trim().toLowerCase()).filter(Boolean);
    const sources = savedSources.length > 0 ? savedSources : [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_SEARCH_SOURCES"]
    ];
    const roles = (prefs?.target_roles ?? []).slice(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_SEARCH_TITLES"]);
    const homeZip = prefs?.home_zip?.trim() ?? "";
    const maxCommute = prefs?.max_commute_miles ?? (prefs?.hybrid_allowed || prefs?.onsite_allowed ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ONSITE_MILES_OPTIONS"][2].value : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ONSITE_MILES_OPTIONS"][2].value);
    return {
        titles: roles,
        location: prefs?.preferred_locations?.[0] ?? "",
        locationZip: homeZip,
        salaryMin: prefs?.salary_min != null ? String(prefs.salary_min) : "",
        salaryMax: prefs?.salary_max != null ? String(prefs.salary_max) : "",
        postedWithinDays: prefs?.posted_within_days ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_POSTED_WITHIN_DAYS"],
        remoteAllowed: prefs?.remote_allowed ?? true,
        hybridAllowed: prefs?.hybrid_allowed ?? true,
        onsiteAllowed: prefs?.onsite_allowed ?? Boolean(homeZip),
        maxOnsiteMiles: maxCommute,
        sources
    };
}
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
"[project]/src/lib/jobs/management-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findManagementRequirement",
    ()=>findManagementRequirement,
    "isManagementBlocked",
    ()=>isManagementBlocked,
    "isStrictSeniorityTitleBlocked",
    ()=>isStrictSeniorityTitleBlocked
]);
/** Mirrors job_engine/management_filter.py (IC-focused strict search). */ const STRICT_TITLE_REJECT = [
    /\bengineering\s+manager\b/i,
    /\bsoftware\s+engineering\s+manager\b/i,
    /\bdevelopment\s+manager\b/i,
    /\bdirector\s+of\s+engineering\b/i,
    /\bhead\s+of\s+engineering\b/i,
    /\bvp\s+(?:of\s+)?engineering\b/i,
    /\bstaff\s+engineer\b/i,
    /\bprincipal\s+engineer\b/i,
    /\bsenior\s+software\s+engineer\b/i,
    /\bsenior\s+engineer\b/i,
    /\blead\s+software\s+engineer\b/i,
    /\blead\s+engineer\b/i,
    /\b(?:sr\.?|senior)\s+(?:swe|sde|software\s+developer)\b/i
];
const MANAGEMENT_REQUIREMENT = [
    /\d{1,2}\s*\+?\s*years?\s+of\s+engineering\s+management/i,
    /\bengineering\s+management\s+experience\b/i,
    /\bpeople\s+management\s+experience\b/i,
    /\b(?:as\s+a\s+|serve\s+as\s+a\s+)?people\s+manager\b/i,
    /\bmanaged\s+a\s+team\s+of\s+(?:[\w\s,./-]{0,40})?(?:engineers|developers)\b/i,
    /\d{1,2}\s*\+?\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,30})?managing\s+(?:a\s+team\s+of\s+)?(?:engineers|developers)\b/i
];
const COLLABORATION_LINE = /\b(?:work\s+with|collaborate\s+with|partner\s+with|report\s+to|support\s+the)\s+[\w\s,./-]{0,60}(?:manager|managers|leadership)\b/i;
function lineIsCollaborationOnly(line) {
    const stripped = line.trim();
    if (!stripped || !COLLABORATION_LINE.test(stripped)) return false;
    return !MANAGEMENT_REQUIREMENT.some((pattern)=>pattern.test(stripped));
}
function findManagementRequirement(text) {
    if (!text.trim()) return null;
    for (const line of text.split("\n")){
        if (lineIsCollaborationOnly(line)) continue;
        for (const pattern of MANAGEMENT_REQUIREMENT){
            const match = line.match(pattern);
            if (match) return match[0].trim();
        }
    }
    for (const pattern of MANAGEMENT_REQUIREMENT){
        const match = text.match(pattern);
        if (!match) continue;
        const index = match.index ?? 0;
        const snippet = text.slice(Math.max(0, index - 80), index + match[0].length + 40);
        if (COLLABORATION_LINE.test(snippet) && !/experience/i.test(snippet)) continue;
        return match[0].trim();
    }
    return null;
}
function isManagementBlocked(job) {
    const haystack = [
        job.title,
        job.description ?? ""
    ].filter(Boolean).join("\n");
    return findManagementRequirement(haystack) !== null;
}
function isStrictSeniorityTitleBlocked(title) {
    return STRICT_TITLE_REJECT.some((pattern)=>pattern.test(title));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/remote-contradiction.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "remotePostingContradicted",
    ()=>remotePostingContradicted
]);
/** Detect remote-labeled postings that the body says are hybrid/onsite (mirrors worker). */ const WORKPLACE_TYPE_RE = /workplace\s*type\s*:\s*(remote|hybrid|on[-\s]?site)/i;
const HYBRID_RE = /\bhybrid\b/i;
const ONSITE_RE = /\b(on[- ]?site|in[- ]?office|in person)\b/i;
const IN_OFFICE_DAYS_RE = /\b\d+\s+days?\s+(?:a\s+week\s+)?(?:in|on)[- ]?(?:the\s+)?(?:office|site)\b/i;
const ARRANGEMENT_LINE_RE = /^\s*(remote|hybrid|on[- ]?site|onsite|in[- ]?office|in office)\s*$/im;
const BROAD_LOC_RE = /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america|remote)$/i;
function arrangementFromLines(description) {
    if (!description) return null;
    for (const line of description.split(/\r?\n/).slice(0, 30)){
        const match = ARRANGEMENT_LINE_RE.exec(line.trim());
        if (!match) continue;
        return match[1].toLowerCase();
    }
    return null;
}
function remotePostingContradicted(job) {
    const location = (job.location ?? "").trim();
    const haystack = `${job.description ?? ""}\n${location}`.slice(0, 12000);
    const workplace = WORKPLACE_TYPE_RE.exec(haystack);
    if (workplace) {
        const token = workplace[1].toLowerCase();
        if (token.includes("hybrid") || token.includes("site")) return true;
    }
    if (IN_OFFICE_DAYS_RE.test(haystack)) return true;
    const lineMode = arrangementFromLines(job.description);
    if (lineMode === "hybrid" || lineMode === "onsite" || lineMode === "on-site") {
        return true;
    }
    const broad = !location || BROAD_LOC_RE.test(location) || /^remote\s*[-–—]/i.test(location);
    if (broad) {
        const head = haystack.slice(0, 4000);
        if (HYBRID_RE.test(head)) return true;
        if (ONSITE_RE.test(head)) return true;
    }
    return false;
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
"[project]/src/lib/jobs/salary-filter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "belowSalaryFloor",
    ()=>belowSalaryFloor,
    "isSalaryOutOfRange",
    ()=>isSalaryOutOfRange,
    "salaryPrefsFromPreferences",
    ()=>salaryPrefsFromPreferences,
    "salaryRangesOverlap",
    ()=>salaryRangesOverlap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$from$2d$text$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jobs/salary-from-text.ts [app-client] (ecmascript)");
;
function belowSalaryFloor(jobMin, jobMax, userMin) {
    if (userMin == null) return false;
    const top = jobMax ?? jobMin ?? null;
    return top != null && top < userMin;
}
function salaryRangesOverlap(jobMin, jobMax, userMin, userMax) {
    const effectiveJobMin = jobMin ?? jobMax ?? null;
    const effectiveJobMax = jobMax ?? jobMin ?? null;
    if (effectiveJobMin === null && effectiveJobMax === null) {
        return true;
    }
    const floor = userMin ?? 0;
    const ceiling = userMax ?? Number.POSITIVE_INFINITY;
    const jMin = effectiveJobMin ?? effectiveJobMax;
    const jMax = effectiveJobMax ?? effectiveJobMin;
    return !(jMax < floor || jMin > ceiling);
}
function isSalaryOutOfRange(job, prefs) {
    if (prefs.min == null && prefs.max == null) {
        return false;
    }
    const { min: jobMin, max: jobMax } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jobs$2f$salary$2d$from$2d$text$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["effectiveJobSalary"])(job);
    if (jobMin == null && jobMax == null) {
        return false;
    }
    if (belowSalaryFloor(jobMin, jobMax, prefs.min)) {
        return true;
    }
    return !salaryRangesOverlap(jobMin, jobMax, prefs.min, prefs.max);
}
function salaryPrefsFromPreferences(prefs) {
    return {
        min: prefs?.salary_min ?? null,
        max: prefs?.salary_max ?? null
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/salary-from-text.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "effectiveJobSalary",
    ()=>effectiveJobSalary,
    "extractCompensationFromText",
    ()=>extractCompensationFromText
]);
/** Client-side compensation parsing from job descriptions (mirrors worker parsers). */ const LINKEDIN_K_YR_RANGE = /\$?\s*(\d[\d,]*(?:\.\d+)?)\s*[kK]\s*\/?\s*yr\s*[-–—]\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*[kK]\s*\/?\s*yr/i;
const LINKEDIN_FULL_YR_RANGE = /\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*\/?\s*yr\s*[-–—]\s*\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*\/?\s*yr/i;
const SALARY_HINT = /(salary|compensation|pay|range|\$\s*\d)/i;
const SALARY_IN_TEXT = /\$?\s*(\d[\d,]*(?:\.\d+)?)\s*([kK])?\s*(?:\s*(?:-|–|—|to)\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*([kK])?)?\s*(?:per\s+year|\/yr|\/year|yearly|annually|annual|\/mo|monthly|a\s+year)?/gi;
function parseMoney(raw, hasK) {
    const cleaned = raw.replace(/,/g, "");
    const value = Number.parseFloat(cleaned);
    if (Number.isNaN(value)) return null;
    if (hasK || value < 1000) {
        return value * 1000;
    }
    return value;
}
function sanitizeRange(min, max) {
    if (min != null && (min < 25_000 || min > 400_000)) min = null;
    if (max != null && (max < 25_000 || max > 400_000)) max = null;
    if (min != null && max != null && min > max) {
        return {
            min: max,
            max: min
        };
    }
    return {
        min,
        max
    };
}
function extractCompensationFromText(text) {
    if (!text?.trim()) return {
        min: null,
        max: null
    };
    let match = text.match(LINKEDIN_FULL_YR_RANGE);
    if (match) {
        const min = Number.parseFloat(match[1].replace(/,/g, ""));
        const max = Number.parseFloat(match[2].replace(/,/g, ""));
        return sanitizeRange(min, max);
    }
    match = text.match(LINKEDIN_K_YR_RANGE);
    if (match) {
        const min = parseMoney(match[1], true);
        const max = parseMoney(match[2], true);
        return sanitizeRange(min, max);
    }
    if (!SALARY_HINT.test(text)) {
        return {
            min: null,
            max: null
        };
    }
    let bestMin = null;
    let bestMax = null;
    let bestScore = -1;
    for (const m of text.matchAll(SALARY_IN_TEXT)){
        const min = parseMoney(m[1], Boolean(m[2]));
        const max = m[3] ? parseMoney(m[3], Boolean(m[4])) : min;
        if (min == null) continue;
        const hi = max ?? min;
        if (min < 15_000 || hi > 1_000_000) continue;
        const score = (min + hi) / 2;
        if (score > bestScore) {
            bestScore = score;
            bestMin = min;
            bestMax = hi;
        }
    }
    return sanitizeRange(bestMin, bestMax);
}
function effectiveJobSalary(job) {
    const storedMin = job.salary_min ?? null;
    const storedMax = job.salary_max ?? null;
    if (storedMin != null || storedMax != null) {
        return {
            min: storedMin,
            max: storedMax
        };
    }
    const body = [
        job.title,
        job.description
    ].filter(Boolean).join("\n");
    return extractCompensationFromText(body);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/jobs/strict-mode.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isStrictFiltering",
    ()=>isStrictFiltering
]);
function isStrictFiltering(preferences) {
    if (!preferences) return true;
    return preferences.strict_filtering !== false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_05ijc-j._.js.map