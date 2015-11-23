load("/tools/build_rules/closure/closure_js_binary", "closure_js_binary")
load("/tools/build_rules/closure/closure_js_library", "closure_js_library")
load("/tools/build_rules/closure/closure_stylesheet_library", "closure_stylesheet_library")
load("/tools/build_rules/closure/closure_template_library", "closure_template_library")

closure_js_binary(
    name = "point",
    deps = [":point_lib"],
)

closure_js_library(
    name = "point_lib",
    srcs = ["point.js"],
    deps = [
        "@closure_library//:closure_library",
    ]
)

