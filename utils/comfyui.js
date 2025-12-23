import { sleep, generateRandomSeed, zhengmian, fumian, getRequestHeaders, prompt_replace, addLog, clearLog, parsePromptStringWithCoordinates, prompt_replace_for_character, stripChineseAnnotations } from "./utils.js";
import { extension_settings } from "../../../../extensions.js";
import { extensionName, EventType } from "./config.js";
import { setItemImg } from "./database.js";
import { saveChatDebounced, saveSettingsDebounced, eventSource } from "../../../../../script.js";
import { initializeImageProcessing } from "./iframe.js";
import { processCharacterPrompt } from "./characterprompt.js";
import { bananaGenerate } from "./banana.js";
async function replacepro(_0x3d922f, _0x12ff3a) {
  console.log("payload222", _0x3d922f);
  _0x12ff3a = _0x12ff3a.replaceAll("\"%seed%\"", Number(_0x3d922f.seed));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%steps%\"", Number(_0x3d922f.steps));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%cfg_scale%\"", Number(_0x3d922f.cfg_scale));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%sampler_name%\"", "" + ("\"" + _0x3d922f.sampler_name + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%width%\"", Number(_0x3d922f.width));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%height%\"", Number(_0x3d922f.height));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%negative_prompt%\"", "" + ("\"" + _0x3d922f.negative_prompt + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%prompt%\"", "" + ("\"" + _0x3d922f.prompt.replaceAll("\"", "\\\"") + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%MODEL_NAME%\"", "\"" + _0x3d922f.MODEL_NAME + "\"");
  _0x12ff3a = _0x12ff3a.replaceAll("\"%c_quanzhong%\"", Number(_0x3d922f.c_quanzhong));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%c_idquanzhong%\"", Number(_0x3d922f.c_idquanzhong));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%c_xijie%\"", Number(_0x3d922f.c_xijie));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%c_fenwei%\"", Number(_0x3d922f.c_fenwei));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%comfyuicankaotupian%\"", "" + ("\"" + _0x3d922f.comfyuicankaotupian + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%ipa%\"", "" + ("\"" + _0x3d922f.ipa + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%scheduler%\"", "" + ("\"" + _0x3d922f.scheduler + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%vae%\"", "" + ("\"" + _0x3d922f.vae + "\""));
  _0x12ff3a = _0x12ff3a.replaceAll("\"%clip%\"", "" + ("\"" + _0x3d922f.clip + "\""));
  console.log(_0x12ff3a);
  return _0x12ff3a;
}
export async function generateComfyUIImage({
  prompt: _0x109f22,
  width: _0x254c4b,
  height: _0x322e91,
  change: _0x5852f3
}) {
  clearLog();
  _0x109f22 = processCharacterPrompt(_0x109f22);
  console.log("link", _0x109f22);
  _0x109f22 = await stripChineseAnnotations(_0x109f22);
  let _0x1e33d2 = _0x5852f3;
  _0x5852f3 = processCharacterPrompt(_0x5852f3);
  _0x5852f3 = await stripChineseAnnotations(_0x5852f3);
  addLog("开始 ComfyUI 生图流程。客户端为" + extension_settings[extensionName].client);
  addLog("请求工作流id - " + extension_settings[extensionName].workerid);
  addLog("请求尺寸: 宽度 - " + (_0x254c4b || "默认") + ", 高度 - " + (_0x322e91 || "默认"));
  if (extension_settings[extensionName].MODEL_NAME.trim() === "连接后选择") {
    addLog("请填写ComfyUI模型。");
    toastr.error("请填写ComfyUI模型。");
    return;
  }
  const _0x5508ef = extension_settings[extensionName].comfyuiUrl.trim();
  const _0x33f82f = _0x5852f3 && _0x5852f3.trim() !== "" ? _0x5852f3 : _0x109f22;
  addLog("用于生成的Tag: " + _0x33f82f);
  let _0x411c27 = false;
  if (_0x33f82f.includes("Scene Composition")) {
    _0x411c27 = true;
  }
  addLog("是否启用分角色模式 (Divide_roles): " + _0x411c27);
  let _0x50c2d7 = {};
  let _0x21d160 = "";
  let _0x5c5a68 = "";
  if (_0x411c27) {
    addLog("分角色模式: 解析带坐标的提示词字符串。");
    _0x50c2d7 = parsePromptStringWithCoordinates(_0x33f82f);
    _0x21d160 = _0x50c2d7["Scene Composition"];
    for (let _0x213c14 = 1; _0x213c14 <= 4; _0x213c14++) {
      if (_0x50c2d7["Character " + _0x213c14 + " Prompt"]) {
        _0x5c5a68 = _0x5c5a68 + ", " + _0x50c2d7["Character " + _0x213c14 + " Prompt"];
      }
    }
  } else {
    addLog("标准模式: 使用请求中的 prompt。");
    _0x21d160 = _0x33f82f;
  }
  let {
    modifiedPrompt: _0x31b9d7,
    insertions: _0x4a7291
  } = await prompt_replace(_0x21d160, _0x5c5a68);
  if (_0x411c27) {
    for (let _0x5a52ae = 1; _0x5a52ae <= 4; _0x5a52ae++) {
      if (_0x50c2d7["Character " + _0x5a52ae + " Prompt"]) {
        _0x31b9d7 = _0x31b9d7 + " | " + prompt_replace_for_character(_0x50c2d7["Character " + _0x5a52ae + " Prompt"]);
      }
    }
  }
  let _0x5e58c6 = await zhengmian(extension_settings[extensionName].yushe[extension_settings[extensionName].yusheid_comfyui].fixedPrompt, _0x31b9d7, extension_settings[extensionName].yushe[extension_settings[extensionName].yusheid_comfyui].fixedPrompt_end, extension_settings[extensionName].AQT_comfyui, _0x4a7291);
  _0x5e58c6 = _0x38ca1f(_0x5e58c6);
  function _0x38ca1f(_0x37839f) {
    const _0x527293 = /<lora:([^:]+)(?:\.safetensors)?:([^>]+)(?::1)?>/g;
    return _0x37839f.replace(_0x527293, (_0x454c1b, _0x3b3f14, _0x3be241) => {
      if (_0x454c1b.includes(".safetensors")) {
        return _0x454c1b;
      }
      if (_0x3be241.includes(":")) {
        return "<lora:" + _0x3b3f14 + ".safetensors:" + _0x3be241 + ">";
      }
      return "<lora:" + _0x3b3f14 + ".safetensors:" + _0x3be241 + ":1>";
    });
  }
  if (extension_settings[extensionName].worker.includes("全能提示词编辑器")) {
    _0x5e58c6 = _0x5e58c6.replaceAll("<lora:", "<wlr:");
    _0x5e58c6 = _0x5e58c6.replaceAll(".safetensors", "");
  }
  console.log("prompt", _0x5e58c6);
  addLog("正面提示词: " + _0x5e58c6);
  let _0x67e712 = await fumian(extension_settings[extensionName].yushe[extension_settings[extensionName].yusheid_comfyui].negativePrompt, extension_settings[extensionName].UCP_comfyui);
  if (extension_settings[extensionName].worker.includes("全能提示词编辑器")) {
    _0x67e712 = _0x67e712.replaceAll("<lora:", "<wlr:");
  } else {
    _0x67e712 = _0x38ca1f(_0x67e712);
  }
  addLog("负面提示词: " + _0x67e712);
  _0x5e58c6 = _0x5e58c6.replaceAll("\n", ",").replace(/,{2,}/g, ",").replaceAll("\\\\", "\\").replaceAll("\\", "\\\\");
  _0x67e712 = _0x67e712.replaceAll("\n", ",").replace(/,{2,}/g, ",").replaceAll("\\\\", "\\").replaceAll("\\", "\\\\");
  let _0x23c1df = {
    prompt: _0x5e58c6,
    negative_prompt: _0x67e712,
    steps: extension_settings[extensionName].comfyui_steps,
    sampler_name: extension_settings[extensionName].comfyuisamplerName,
    width: _0x254c4b ? _0x254c4b : extension_settings[extensionName].comfyui_width,
    height: _0x322e91 ? _0x322e91 : extension_settings[extensionName].comfyui_height,
    cfg_scale: extension_settings[extensionName].cfg_comfyui,
    seed: extension_settings[extensionName].comfyui_seed === 0 || extension_settings[extensionName].comfyui_seed === "0" || extension_settings[extensionName].comfyui_seed === "" || extension_settings[extensionName].comfyui_seed === -1 || extension_settings[extensionName].comfyui_seed === "-1" ? generateRandomSeed() : extension_settings[extensionName].comfyui_seed,
    MODEL_NAME: extension_settings[extensionName].MODEL_NAME,
    c_quanzhong: extension_settings[extensionName].c_quanzhong,
    c_idquanzhong: extension_settings[extensionName].c_idquanzhong,
    c_xijie: extension_settings[extensionName].c_xijie,
    c_fenwei: extension_settings[extensionName].c_fenwei,
    comfyuicankaotupian: window.comfyuicankaotupian,
    ipa: extension_settings[extensionName].ipa,
    scheduler: extension_settings[extensionName].comfyui_scheduler,
    vae: extension_settings[extensionName].comfyui_vae,
    clip: extension_settings[extensionName].comfyuiCLIPName
  };
  const _0x2e1a30 = "\n--- 生图参数报告 ---\n正面提示词: " + _0x23c1df.prompt + "\n负面提示词: " + _0x23c1df.negative_prompt + "\n模型: " + _0x23c1df.MODEL_NAME + "\n采样器: " + _0x23c1df.sampler_name + "\n步数: " + _0x23c1df.steps + "\nCFG Scale: " + _0x23c1df.cfg_scale + "\n种子: " + _0x23c1df.seed + "\n尺寸: " + _0x23c1df.width + "x" + _0x23c1df.height + "\nVAE: " + _0x23c1df.vae + "\nScheduler: " + _0x23c1df.scheduler + "\n--------------------\n";
  addLog(_0x2e1a30);
  const _0x5879a8 = "533ef3a3-39c0-4e39-9ced-37d290f371f8";
  _0x23c1df = await replacepro(_0x23c1df, extension_settings[extensionName].worker);
  _0x23c1df = "{\"client_id\":\"" + _0x5879a8 + "\", \"prompt\":" + _0x23c1df + "}";
  addLog("发送到 ComfyUI 的最终 payload: " + _0x23c1df);
  let _0x298edf = true;
  while (_0x298edf) {
    if (window.xiancheng) {
      _0x298edf = false;
    } else {
      await sleep(1000);
    }
  }
  try {
    window.xiancheng = false;
    let _0x1ef32a;
    if (extension_settings[extensionName].client === "jiuguan") {
      const _0x37ff8d = {
        url: _0x5508ef,
        prompt: _0x23c1df
      };
      const _0x50330f = await fetch("/api/sd/comfy/generate", {
        method: "POST",
        body: JSON.stringify(_0x37ff8d),
        headers: getRequestHeaders(window.token)
      });
      if (!_0x50330f.ok) {
        const _0x390bca = await _0x50330f.text();
        addLog("API 请求失败 (jiuguan client): " + _0x390bca);
        throw new Error("请求失败,状态码: " + _0x50330f.status + ", 详情: " + _0x390bca);
      }
      const _0x132043 = await _0x50330f.text();
      let _0x574086;
      let _0x13170c;
      try {
        const _0x234cdc = JSON.parse(_0x132043);
        _0x574086 = _0x234cdc.format;
        _0x13170c = _0x234cdc.data;
      } catch (_0x379c9c) {
        addLog("JSON 解析失败，尝试作为原始 Base64 数据处理。");
        _0x574086 = "png";
        _0x13170c = _0x132043;
      }
      if (!_0x13170c) {
        addLog("API 响应中没有图片数据 (jiuguan client)。");
        throw new Error("Endpoint did not return image data.");
      }
      addLog("图片生成成功 (jiuguan client)。");
      _0x1ef32a = "data:image/" + _0x574086 + ";base64," + _0x13170c;
    } else {
      const _0x3c2be5 = new URL(_0x5508ef + "/prompt");
      const _0x4d420e = await fetch(_0x3c2be5, {
        method: "POST",
        body: _0x23c1df,
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!_0x4d420e.ok) {
        const _0x3a9900 = await _0x4d420e.text();
        addLog("API 请求失败 (direct comfyui): " + _0x3a9900);
        throw new Error("请求失败,状态码: " + _0x4d420e.status + ", 详情: " + _0x3a9900);
      }
      const _0x538801 = await _0x4d420e.json();
      let _0x385727 = _0x538801.prompt_id;
      let _0x222e03 = 0;
      while (true) {
        try {
          const _0x281ecc = await fetch(_0x5508ef + "/history/" + _0x385727);
          if (!_0x281ecc.ok) {
            addLog("轮询历史记录时出错: " + _0x281ecc.status);
            throw new Error("History request failed: " + _0x281ecc.status);
          }
          let _0x18547d = await _0x281ecc.json();
          console.log("response2", _0x18547d);
          if (_0x18547d.hasOwnProperty(_0x385727)) {
            function _0x45f131(_0x4ed948) {
              for (const _0x2e55c4 in _0x4ed948) {
                const _0x22a7eb = _0x4ed948[_0x2e55c4];
                if (_0x22a7eb.images && _0x22a7eb.images.length > 0) {
                  return _0x22a7eb.images[0].filename;
                }
              }
              return null;
            }
            addLog("图片生成成功 (direct comfyui)。");
            let _0x2da0ae = _0x45f131(_0x18547d[_0x385727].outputs);
            if (!_0x2da0ae) {
              throw new Error("未能从API响应中找到文件名。");
            }
            let _0x50e0c2 = _0x5508ef + "/view?filename=" + _0x2da0ae + "&type=output";
            const _0x3d266c = await fetch(_0x50e0c2);
            if (!_0x3d266c.ok) {
              throw new Error("获取图片失败,状态码: " + _0x3d266c.status);
            }
            const _0x5b3ee7 = await _0x3d266c.blob();
            _0x1ef32a = await new Promise((_0x410c02, _0x4d16b7) => {
              const _0x3dbb44 = new FileReader();
              _0x3dbb44.onloadend = () => _0x410c02(_0x3dbb44.result);
              _0x3dbb44.onerror = _0x4d16b7;
              _0x3dbb44.readAsDataURL(_0x5b3ee7);
            });
            break;
          }
          await sleep(1000);
          _0x222e03++;
          if (_0x222e03 > 200) {
            addLog("轮询超时，服务器可能已断开连接。");
            throw new Error("ComfyUI 服务器超时。");
          }
        } catch (_0x11f45e) {
          addLog("轮询时发生异常: " + _0x11f45e);
          throw _0x11f45e;
        }
      }
    }
    window.xiancheng = true;
    if (!_0x1ef32a) {
      throw new Error("未能生成图片 URL。");
    }
    addLog("图像已成功获取并格式化为 data URL。");
    return {
      image: _0x1ef32a,
      change: _0x1e33d2 || ""
    };
  } catch (_0x133cb6) {
    window.xiancheng = true;
    addLog("图片生成过程中发生错误: " + _0x133cb6.message);
    console.error("Error generating image:", _0x133cb6);
    throw _0x133cb6;
  }
}
async function comfyuigenerate(_0x10664f) {
  let {
    id: _0x207f66,
    prompt: _0x36dba0,
    width: _0x56e05b,
    height: _0x4f7873,
    change: _0x1d9501
  } = _0x10664f;
  addLog("收到生图请求 (ID: " + _0x207f66 + ") - Prompt: " + _0x36dba0 + (_0x1d9501 ? " - Change: " + _0x1d9501 : ""));
  if (_0x1d9501 && _0x1d9501.includes("{修图}")) {
    bananaGenerate(_0x10664f);
    return;
  }
  try {
    const {
      image: _0x3679d3,
      change: _0x2008c8
    } = await generateComfyUIImage({
      prompt: _0x36dba0,
      width: _0x56e05b,
      height: _0x4f7873,
      change: _0x1d9501
    });
    if (extension_settings[extensionName].cache != "0") {
      const _0x41950b = {
        change: _0x2008c8
      };
      await setItemImg(_0x36dba0, _0x3679d3, _0x41950b);
      addLog("图像已存入数据库 for prompt: " + _0x36dba0);
    } else {
      addLog("缓存设置为不存入数据库");
    }
    const _0x4a97bf = {
      id: _0x207f66,
      success: true,
      imageData: _0x3679d3,
      prompt: _0x36dba0,
      change: _0x2008c8
    };
    eventSource.emit(EventType.GENERATE_IMAGE_RESPONSE, _0x4a97bf);
    addLog("发送生图成功响应 (ID: " + _0x207f66 + ")");
  } catch (_0x119579) {
    const _0x194f8a = "生图流程捕获到异常 (ID: " + _0x207f66 + "): " + _0x119579.message;
    addLog("错误: " + _0x194f8a);
    console.error("Error generating image:", _0x119579);
    const _0x2b2243 = {
      id: _0x207f66,
      success: false,
      error: _0x119579.message,
      prompt: _0x36dba0
    };
    eventSource.emit(EventType.GENERATE_IMAGE_RESPONSE, _0x2b2243);
    addLog("发送生图失败响应 (ID: " + _0x207f66 + ")");
  }
}
function initializeComfyuiListener() {
  eventSource.on(EventType.GENERATE_IMAGE_REQUEST, comfyuigenerate);
  addLog("comfyui 生图事件监听器已初始化。");
}
export async function replaceWithcomfyui() {
  if (extension_settings[extensionName].mode == "comfyui") {
    if (!window.initializeComfyuiListener) {
      window.initializeComfyuiListener = true;
      initializeComfyuiListener();
    }
    initializeImageProcessing();
  } else if (window.initializeComfyuiListener) {
    eventSource.removeListener(EventType.GENERATE_IMAGE_REQUEST, comfyuigenerate);
    window.initializeComfyuiListener = false;
    addLog("comfyui 生图事件监听器已关闭。");
  }
}
//# sourceMappingURL=http://localhost:8000/comfyui.js.map