/* wgsl */
struct MyStruct {
    color: vec4<f32>,
    time: f32,
    model: mat4x4<f32>,
    viewProj: mat4x4<f32>,
    normalMat: mat4x4<f32>
}

struct VertexOut {
    @builtin(position) position : vec4f,
   // @location(0) color : vec4f,
    @location(0) normal: vec3f,
    @location(1) time: f32,
    @location(2) uv: vec2f,
}


@group(0) @binding(0) var<uniform> myStruct: MyStruct;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;



@vertex
fn vmain(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>
    ) -> VertexOut
{
    var output : VertexOut;
    output.position = myStruct.viewProj * myStruct.model * vec4(position,1.0);
    //output.position.x += sin(myStruct.time*0.01)*output.position.y*0.1;
    //output.color = vec4f(abs(position.x),abs(cos(myStruct.time * 0.0005)*0.5),0.0,1.0);
    output.normal = (myStruct.normalMat * vec4(normal,-1.0)).xyz;
    //output.normal = normal;
    output.time = myStruct.time;
    output.uv = uv;
    return output;
}




@fragment
fn fmain(fragData: VertexOut) -> @location(0) vec4f
{

  let lightDirection = normalize(vec3f(sin(fragData.time*0.001)*5.0, 0.0, 1.0)); // Directional light example
    let normal = normalize(fragData.normal);
    let lightIntensity = max(dot(normal, lightDirection), 0.0);
    let ambient = vec3f(0.4, 0.4, 0.4);
    let diffuse = vec3f(0.8, 0.4, 0.4) * lightIntensity;
    let color = ambient + diffuse;

   return  textureSample(tex, samp, fragData.uv) * vec4(color, 1.0);
    //return vec4(color, 1.0); // Remove clamping for now

//  let color =  vec3f(0.4,0.4,0.4) + (vec3f(0.8, 0.3, 0.8) * lightIntensity);

   //let normal =   normalize(fragData.normal) * 0.5 + vec3<f32>(0.5, 0.5, 0.5);
    //let light = dot(normal, -uni.lightDirection);
    // return textureSample(ourTexture, ourSampler, fsInput.texcoord);
    //return  (fragData.color + abs(sin(fragData.position.x * 0.001)));
   // return vec4(color, 1.0);
    //return vec4(normal * 0.5 + 0.5, 1.0);
}
