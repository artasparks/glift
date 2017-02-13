load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_library", "closure_js_binary")

closure_js_library(
    name = "glift_root",
    srcs = ["glift.js"],
    visibility = ["//visibility:public"],
)

closure_js_binary(
    name = "glift-bin",
    deps = [
        ":glift_root",
        "//src/util",
    ],
)
