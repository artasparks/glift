load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_library")

closure_js_library(
    name = "util",
    srcs = glob(
        ["*.js"],
        exclude = ["*_test.js"],
    ),
    visibility = ["//visibility:public"],
    deps = ["//src:glift_root"],
)
