package com.edatalia.webforms.presentation

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.print.HtmlToPdfConverter
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.net.toUri
import com.edatalia.webforms.domain.Constants
import org.json.JSONObject
import java.io.File
import java.util.UUID

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebFormsSdkLauncherScreen(uri: Uri) {
    val activity = LocalContext.current as Activity
    var jsonFormsString: String? = null
    LaunchedEffect(Unit) {
        val jsonBytes = activity.contentResolver.openInputStream(uri).use {
            it?.readBytes()
        }
        jsonFormsString = jsonBytes?.decodeToString()
        if (jsonFormsString == null) {
            val resultIntent = Intent()
            resultIntent.putExtra(
                Constants.RESPONSE_ERROR_STRING,
                "Input not valid"
            )
            activity.setResult(ComponentActivity.RESULT_FIRST_USER, resultIntent)
            activity.finish()
            return@LaunchedEffect
        }
    }
    AndroidView(
        factory = { WebView(activity) },
        update = {
            it.apply {
                settings.javaScriptEnabled = true
                settings.allowFileAccessFromFileURLs = true
                addJavascriptInterface(object {
                    @JavascriptInterface
                    fun postMessage(messageFromCallbackJsonString: String) {
                        try {
                            val jsonObject = JSONObject(messageFromCallbackJsonString)
                            val type = jsonObject.getString("type")
                            if (type == "output") {
                                val json = jsonObject.getJSONObject("json")
                                val html = jsonObject.getString("html")
                                val converter = HtmlToPdfConverter.instance
                                val file = File(
                                    activity.getExternalFilesDir(null),
                                    "${UUID.randomUUID()}.pdf"
                                )
                                converter.convert(activity, html, file) {
                                    val resultIntent = Intent()
                                    resultIntent.putExtra(
                                        Constants.RESPONSE_URI_STRING,
                                        file.toUri().toString()
                                    )
                                    resultIntent.putExtra(
                                        Constants.RESPONSE_JSON_STRING,
                                        json.toString()
                                    )
                                    activity.setResult(ComponentActivity.RESULT_OK, resultIntent)
                                    activity.finish()
                                    return@convert
                                }
                            } else if (type == "error") {
                                val value = jsonObject.getString("value")
                                throw Exception(value)
                            }
                        } catch (exception: Exception) {
                            val resultIntent = Intent()
                            resultIntent.putExtra(
                                Constants.RESPONSE_ERROR_STRING,
                                exception.toString()
                            )
                            activity.setResult(ComponentActivity.RESULT_FIRST_USER, resultIntent)
                            activity.finish()
                            return
                        }
                    }
                }, Constants.JS_CALLBACK_INTERFACE)
                loadUrl(Constants.ASSETS_INDEX_HTML)
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        val jsExpresionToConvert =
                            "jsonForms.init($jsonFormsString, (result) => { ${Constants.JS_CALLBACK_INTERFACE}.postMessage(result); })"
                        evaluateJavascript(jsExpresionToConvert, null)
                    }
                }
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
