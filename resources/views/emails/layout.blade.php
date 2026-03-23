<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('titulo', 'Notificação')</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; color: #333333; }
        .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #1a2b4a; padding: 28px 32px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 1px; margin: 0; }
        .header p { color: #a8c0e0; font-size: 13px; margin-top: 4px; }
        .body { padding: 36px 32px; }
        .body h2 { font-size: 18px; color: #1a2b4a; margin-bottom: 16px; }
        .body p { font-size: 14px; line-height: 1.7; color: #444444; margin-bottom: 12px; }
        .body .info-box { background-color: #f0f4fa; border-left: 4px solid #1a2b4a; padding: 14px 18px; border-radius: 4px; margin: 20px 0; }
        .body .info-box p { margin: 0; font-size: 13px; }
        .body .info-box strong { color: #1a2b4a; }
        .btn { display: inline-block; margin-top: 20px; padding: 12px 28px; background-color: #1a2b4a; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: 600; }
        .divider { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
        .footer { background-color: #f4f4f4; padding: 20px 32px; text-align: center; }
        .footer p { font-size: 11px; color: #999999; line-height: 1.6; }
        .footer a { color: #1a2b4a; text-decoration: none; }
    </style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center" style="padding: 24px 0;">
            <div class="wrapper">

                <!-- TOPO -->
                <div class="header">
                    <h1>⚡ Demand3</h1>
                    <p>Plataforma de Gestão de Demandas</p>
                </div>

                <!-- CORPO -->
                <div class="body">
                    @yield('content')
                </div>

                <!-- RODAPÉ -->
                <div class="footer">
                    <hr class="divider" style="border:none;border-top:1px solid #ddd;margin:0 0 16px;">
                    <p>
                        Você está recebendo este e-mail porque possui uma conta na plataforma <strong>Demand3</strong>.<br>
                        Em caso de dúvidas, entre em contato pelo e-mail
                        <a href="mailto:suporte@pulodogato.art.br">suporte@pulodogato.art.br</a>.
                    </p>
                    <p style="margin-top:8px;">© {{ date('Y') }} Demand3. Todos os direitos reservados.</p>
                </div>

            </div>
        </td>
    </tr>
</table>
</body>
</html>
