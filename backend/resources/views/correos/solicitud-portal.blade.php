<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background:#F4F5F7; font-family: Arial, sans-serif; color:#23252B;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7; padding:24px 0;">
        <tr>
            <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; overflow:hidden;">
                    <tr>
                        <td style="background:#E31E24; padding:18px 24px;">
                            <span style="color:#fff; font-weight:800; font-size:16px;">PUBLICIDAD ROMÁN MEGAVALLAS</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <h2 style="margin:0 0 4px; font-size:18px;">
                                Nueva solicitud {{ $solicitud->codigo }}
                            </h2>
                            <p style="color:#7A7E8C; font-size:13px; margin:0 0 20px;">
                                @if ($sinEjecutivo)
                                    No hay ejecutivos activos para asignarla: revísala y asígnala desde el SIGC.
                                @else
                                    Te fue asignada por turno. Contacta al cliente lo antes posible.
                                @endif
                            </p>

                            <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                                <tr>
                                    <td style="color:#7A7E8C;">Cliente</td>
                                    <td align="right"><strong>{{ $solicitud->nombre }}</strong></td>
                                </tr>
                                @if ($solicitud->empresa)
                                <tr>
                                    <td style="color:#7A7E8C;">Empresa</td>
                                    <td align="right"><strong>{{ $solicitud->empresa }}</strong></td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="color:#7A7E8C;">Teléfono</td>
                                    <td align="right"><strong>{{ $solicitud->telefono }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="color:#7A7E8C;">Correo</td>
                                    <td align="right"><strong>{{ $solicitud->correo }}</strong></td>
                                </tr>
                                @if ($solicitud->fecha_inicio_deseada)
                                <tr>
                                    <td style="color:#7A7E8C;">Inicio deseado</td>
                                    <td align="right"><strong>{{ $solicitud->fecha_inicio_deseada->format('d/m/Y') }}</strong></td>
                                </tr>
                                @endif
                                @if ($solicitud->plazo_meses_deseado)
                                <tr>
                                    <td style="color:#7A7E8C;">Plazo deseado</td>
                                    <td align="right"><strong>{{ $solicitud->plazo_meses_deseado }} mes(es)</strong></td>
                                </tr>
                                @endif
                            </table>

                            <h3 style="margin:24px 0 8px; font-size:14px;">Vallas de interés</h3>
                            <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13px; border-top:1px solid #E6E8EE;">
                                @foreach ($solicitud->vallas as $valla)
                                <tr style="border-bottom:1px solid #E6E8EE;">
                                    <td><strong>{{ $valla->codigo }}</strong> · {{ $valla->referencia }}</td>
                                    <td align="right">
                                        @if ($valla->pivot->precio_mostrado !== null)
                                            ${{ number_format($valla->pivot->precio_mostrado, 2) }}
                                        @endif
                                    </td>
                                </tr>
                                @endforeach
                            </table>

                            @if ($solicitud->mensaje)
                            <h3 style="margin:24px 0 8px; font-size:14px;">Mensaje del cliente</h3>
                            <p style="font-size:13px; margin:0; white-space:pre-line;">{{ $solicitud->mensaje }}</p>
                            @endif

                            <p style="font-size:13px; color:#7A7E8C; margin-top:24px;">
                                Puedes responder directamente a este correo para escribirle al cliente.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
