#!/usr/bin/env bash

self="$0"
image_path="$1"
pattern_path="$2"
out_path="$3"
image_size="$4"
num_iteractions="$5"

cd "$NEURAL_STYLE_HOME"

th neural_style.lua -image_size "$image_size" -num_iterations "$num_iteractions" -style_image "$pattern_path" -content_image "$image_path" -backend cudnn -output_image "$out_path"

#echo $self $image_path $pattern_path $out_path
#
#cat "$image_path" > "$out_path"
#cat "$pattern_path" >> "$out_path"

