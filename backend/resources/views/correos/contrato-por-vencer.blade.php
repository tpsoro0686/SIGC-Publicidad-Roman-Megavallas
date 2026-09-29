<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background:#F4F5F7; font-family: Arial, sans-serif; color:#23252B;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7; padding:24px 0;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; overflow:hidden;">
                    <tr>
                        <td style="background:#E31E24; padding:18px 24px;">
                            <span style="color:#fff; font-weight:800; font-size:16px;">PUBLICIDAD ROMÁN MEGAVALLAS</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <h2 style="margin:0 0 4px; font-size:18px;">
                                Contrato {{ $contrato->codigo }} vence en {{ $diasRestantes }} día{{ $diasRestantes === 1 ? '' : 's' }}
                            </h2>
                            <p style="color:#7A7E8C; font-size:13px; margin:0 0 20px;">
                                Fecha de finalización: {{ $contrato->fecha_fin->format('d/m/Y') }}
                            </p>

                            <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                                <tr>
                                    <td style="color:#7A7E8C;">Cliente</td>
                                    <td align="right"><strong>{{ $contrato->cliente->nombre }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="color:#7A7E8C;">Valla</td>
                                    <td align="right"><strong>{{ $contrato->valla->codigo }} · {{ $contrato->valla->referencia }}</strong></td>
                                </tr>
                                <tr>
                                    <td style="color:#7A7E8C;">Monto mensual</td>
                                    <td align="right"><strong>${{ number_format($contrato->monto_mensual, 2) }}</strong></td>
                                </tr>
                            </table>

                            <p style="font-size:13px; color:#7A7E8C; margin-top:24px;">
                                Contactá al cliente para gestionar la renovación antes de que finalice el plazo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
