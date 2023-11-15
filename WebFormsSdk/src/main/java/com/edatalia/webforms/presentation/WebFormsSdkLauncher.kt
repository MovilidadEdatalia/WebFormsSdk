package com.edatalia.webforms.presentation

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.edatalia.webforms.domain.Constants

class WebFormsSdkLauncher : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val uriString = intent.getStringExtra(Constants.INPUT_URI_STRING)
        if (uriString == null) {
            val resultIntent = Intent()
            resultIntent.putExtra(Constants.RESPONSE_ERROR_STRING, "Input not valid")
            setResult(RESULT_FIRST_USER, resultIntent)
            finish()
            return
        }
        val uri = Uri.parse(uriString)
        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                WebFormsSdkLauncherScreen(uri)
            }
        }
    }

}

