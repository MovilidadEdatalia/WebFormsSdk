package com.edatalia.webformssdk.demo

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.core.net.toFile
import com.edatalia.webforms.domain.WebFormsResultContract
import com.edatalia.webformssdk.demo.ui.theme.WebFormsSdkDemoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WebFormsSdkDemoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WebFormsDemoScreen()
                }
            }
        }
    }
}

@Composable
fun WebFormsDemoScreen() {

    val context = LocalContext.current
    val jsonFileUri: MutableState<Uri?> = remember { mutableStateOf(null) }
    val openAlertDialog = remember { mutableStateOf(false) }
    var alertDialogMessage by remember { mutableStateOf("") }

    val getTransformedDocument = rememberLauncherForActivityResult(
        contract = WebFormsResultContract(),
        onResult = { result ->
            val error = result.error
            val uri = result.responseUriString
            val json = result.responseJsonString
            val rejected = result.rejected

            if (uri != null) {
                val shareableUri = FileProvider.getUriForFile(
                    context.applicationContext,
                    "${context.packageName}.fileprovider",
                    uri.toFile()
                )
                val intent = Intent(Intent.ACTION_VIEW)
                intent.setDataAndType(shareableUri, "application/pdf")
                intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                context.startActivity(intent)
            } else if (error != null) {
                openAlertDialog.value = true
                alertDialogMessage = error
            }
        }
    )

    val getJsonDocument = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
        onResult = { result ->
            getTransformedDocument.launch(result.toString())
        }
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(
            space = 16.dp,
            alignment = Alignment.CenterVertically
        ),
        modifier = Modifier.padding()
    ) {
        Button(
            modifier = Modifier.padding(),
            onClick = {
                getJsonDocument.launch(arrayOf("application/json"))
            }) {
            Text("Seleccionar configuración")
        }


        if (openAlertDialog.value) {
            AlertDialog(
                title = {
                    Text(text = "Error")
                },
                text = {
                    Text(text = alertDialogMessage)
                },
                onDismissRequest = {
                    openAlertDialog.value = false
                },
                confirmButton = {},
                dismissButton = {
                    TextButton(
                        onClick = {
                            openAlertDialog.value = false
                        }
                    ) {
                        Text("Cerrar")
                    }
                }
            )
        }

    }
}